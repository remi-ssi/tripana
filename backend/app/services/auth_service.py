# backend/app/services/auth_service.py

import random
import string
from datetime import datetime, timedelta, timezone
from jose import jwt
from sqlalchemy import delete, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.otp import OTPCode
from app.models.user import User
from app.config import settings
from app.services.email_service import send_otp_email
from app.utils.security import hash_password, verify_password

OTP_EXPIRE_MINUTES = 10   # OTP dies after 10 minutes
RESEND_WAIT_SECONDS = 120 # user must wait 2 minutes before resending
USED_OTP_RETENTION_DAYS = 1  # used OTPs are kept for 1 day then deleted


async def cleanup_old_used_otps(db: AsyncSession, now: datetime) -> None:
    await db.execute(
        delete(OTPCode).where(
            OTPCode.is_used == True,
            or_(
                OTPCode.deleted_at <= now,
                # Backward compatibility for older rows that predate deleted_at.
                (
                    OTPCode.deleted_at.is_(None)
                    & (OTPCode.created_at <= now - timedelta(days=USED_OTP_RETENTION_DAYS))
                ),
            ),
        )
    )
    await db.commit()

#generate a random 6-digit OTP code
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

#send OTP email and save code to DB, enforcing resend cooldown
async def send_registration_otp(email: str, db: AsyncSession) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    # Check if a recent OTP already exists (resend cooldown)
    recent_stmt = (
        select(OTPCode)
        .where(
            OTPCode.email == email,
            OTPCode.is_used == False,
            OTPCode.created_at >= now - timedelta(seconds=RESEND_WAIT_SECONDS),
        )
        .order_by(OTPCode.created_at.desc())
    )
    recent_otp = (await db.execute(recent_stmt)).scalars().first()

    # If there's a recent OTP, tell user to wait before resending
    if recent_otp:
        wait_seconds = int(
            (recent_otp.created_at + timedelta(seconds=RESEND_WAIT_SECONDS)
             - now).total_seconds()
        )
        return {"error": f"Please wait {wait_seconds} seconds before resending."}

    # Invalidate all previous unused OTPs for this email
    await db.execute(
        update(OTPCode)
        .where(OTPCode.email == email, OTPCode.is_used == False)
        .values(is_used=True, deleted_at=now + timedelta(days=USED_OTP_RETENTION_DAYS))
    )
    await db.commit()

    # Create new OTP
    code = generate_otp()
    otp = OTPCode(
        email=email,
        hashed_code=hash_password(code),
        expires_at=now + timedelta(minutes=OTP_EXPIRE_MINUTES)
    )
    db.add(otp)
    await db.commit()

    # Send email
    try:
        send_otp_email(email, code)
    except Exception:
        return {"error": "Failed to send OTP email. Check your mail configuration."}

    return {"message": "OTP sent to email."}

# Verify OTP and register user, returning JWT token on success
async def verify_otp_and_register(
    email: str,
    code: str,
    password: str,
    first_name: str,
    last_name: str,
    db: AsyncSession,
) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    # Find unused, non-expired OTPs and verify against hashed code
    otp_stmt = (
        select(OTPCode)
        .where(
            OTPCode.email == email,
            OTPCode.is_used == False,
            OTPCode.expires_at > now,
        )
        .order_by(OTPCode.created_at.desc())
    )
    otp_candidates = (await db.execute(otp_stmt)).scalars().all()
    otp = next((item for item in otp_candidates if verify_password(code, item.hashed_code)), None)

    if otp is None:
        return {"error": "Invalid or expired code."}

    # Mark OTP as used so it can't be reused
    otp.is_used = True
    otp.deleted_at = now + timedelta(days=USED_OTP_RETENTION_DAYS)
    await db.commit()

    # Check if user already exists (edge case)
    existing_user = (await db.execute(select(User).where(User.email == email))).scalars().first()
    if existing_user:
        return {"error": "Email already registered."}

    # Save new user
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create JWT token
    token_data = {"sub": str(new_user.user_id), "email": new_user.email}
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return {
        "token": token,
        "user": {
            "user_id": new_user.user_id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
        },
    }