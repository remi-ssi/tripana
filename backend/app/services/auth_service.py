# backend/app/services/auth_service.py

import random
import string
from datetime import datetime, timedelta, timezone
from jose import jwt
from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.otp import OTPCode
from app.models.user import User
from app.config import settings
from app.services.email_service import send_otp_email
from app.utils.security import hash_password, verify_password

OTP_EXPIRE_MINUTES = 10   # OTP dies after 10 minutes
RESEND_WAIT_SECONDS = 120 # user must wait 2 minutes before resending
USED_OTP_RETENTION_DAYS = 1  # used OTPs are kept for 1 day then deleted
MAX_RESEND_ATTEMPTS = 5
RESEND_WINDOW_MINUTES = 10
MAX_VERIFY_ATTEMPTS = 5
ATTEMPT_WINDOW_MINUTES = 10
VERIFY_BLOCK_MINUTES = 15


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


async def get_active_block_until(email: str, db: AsyncSession, now: datetime):
    active_block_stmt = (
        select(OTPCode.blocked_until)
        .where(
            OTPCode.email == email,
            OTPCode.blocked_until.is_not(None),
            OTPCode.blocked_until > now,
        )
        .order_by(OTPCode.blocked_until.desc())
    )
    return (await db.execute(active_block_stmt)).scalars().first()

#generate a random 6-digit OTP code
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

#send OTP email and save code to DB, enforcing resend cooldown
async def send_registration_otp(email: str, db: AsyncSession, is_resend: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    blocked_until = await get_active_block_until(email, db, now)
    if blocked_until:
        wait_seconds = int((blocked_until - now).total_seconds())
        wait_minutes = max(1, (wait_seconds + 59) // 60)
        return {"error": f"Too many attempts. Try again in {wait_minutes} minutes."}

    if is_resend:
        sends_stmt = (
            select(func.count(OTPCode.id))
            .where(
                OTPCode.email == email,
                OTPCode.created_at >= now - timedelta(minutes=RESEND_WINDOW_MINUTES),
            )
        )
        total_sends = int((await db.execute(sends_stmt)).scalar_one())
        resend_count = max(0, total_sends - 1)

        if resend_count >= MAX_RESEND_ATTEMPTS:
            block_until = now + timedelta(minutes=VERIFY_BLOCK_MINUTES)
            await db.execute(
                update(OTPCode)
                .where(OTPCode.email == email)
                .values(blocked_until=block_until)
            )
            await db.commit()
            return {"error": f"Resend limit reached. Verification blocked for {VERIFY_BLOCK_MINUTES} minutes."}

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

    blocked_until = await get_active_block_until(email, db, now)
    if blocked_until:
        wait_seconds = int((blocked_until - now).total_seconds())
        wait_minutes = max(1, (wait_seconds + 59) // 60)
        return {"error": f"Too many attempts. Try again in {wait_minutes} minutes."}

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
        latest_otp = otp_candidates[0] if otp_candidates else None
        if latest_otp:
            latest_otp.attempts = (latest_otp.attempts or 0) + 1
            await db.commit()

        attempts_stmt = (
            select(func.coalesce(func.sum(OTPCode.attempts), 0))
            .where(
                OTPCode.email == email,
                OTPCode.created_at >= now - timedelta(minutes=ATTEMPT_WINDOW_MINUTES),
            )
        )
        attempt_count = int((await db.execute(attempts_stmt)).scalar_one())

        if attempt_count >= MAX_VERIFY_ATTEMPTS:
            block_until = now + timedelta(minutes=VERIFY_BLOCK_MINUTES)
            await db.execute(
                update(OTPCode)
                .where(OTPCode.email == email)
                .values(blocked_until=block_until)
            )
            await db.commit()
            return {"error": f"Too many attempts. Verification blocked for {VERIFY_BLOCK_MINUTES} minutes."}

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