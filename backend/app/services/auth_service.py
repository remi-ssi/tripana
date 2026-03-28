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

# Cleanup old used OTPs to prevent DB bloat. This is called before any OTP generation or verification.
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

# Step 1 (data lookup only): return active block timestamp for this email, or None.
async def get_block_until(email: str, db: AsyncSession, now: datetime):
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

# Step 2 (message adapter): convert active block timestamp to API error payload.
# This wraps get_block_until so callers can reuse the same error message format.
async def block_error(email: str, db: AsyncSession, now: datetime):
    blocked_until = await get_block_until(email, db, now)
    if not blocked_until:
        return None

    wait_seconds = int((blocked_until - now).total_seconds())
    wait_minutes = max(1, (wait_seconds + 59) // 60)
    return {"error": f"Too many attempts. Try again in {wait_minutes} minutes."}

# Step 3 (verification logic): validate submitted code against active OTP rows.
# On failure it increments attempts and may create a new block.
async def validate_otp(email: str, code: str, db: AsyncSession, now: datetime):
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

    if otp:
        return otp, None

    latest_otp = otp_candidates[0] if otp_candidates else None
    if latest_otp:
        latest_otp.attempts = (latest_otp.attempts or 0) + 1
        await db.commit()
   
    # Count attempts in the last ATTEMPT_WINDOW_MINUTES
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
        return None, {"error": f"Too many attempts. Verification blocked for {VERIFY_BLOCK_MINUTES} minutes."}

    return None, {"error": "Invalid or expired code."}

# Mark the OTP as used and set a deletion time so it can't be reused and will eventually be cleaned up.
async def use_otp(otp: OTPCode, db: AsyncSession, now: datetime) -> None:
    otp.is_used = True
    otp.deleted_at = now + timedelta(days=USED_OTP_RETENTION_DAYS)
    await db.commit()

# Build the authentication response containing the JWT token and user info.
def _build_auth_response(user: User) -> dict:
    token_data = {"sub": str(user.user_id), "email": user.email}
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return {
        "token": token,
        "user": {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        },
    }

#generate a random 6-digit OTP code
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

#send OTP email and save code to DB, enforcing resend cooldown
async def send_otp(email: str, db: AsyncSession, is_resend: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    block_error_result = await block_error(email, db, now)
    if block_error_result:
        return block_error_result

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

# verify OTP and create user, returning JWT token on success
async def start_signup(email: str, db: AsyncSession) -> dict:
    user = (await db.execute(select(User).where(User.email == email))).scalars().first()
    if user:
        return {"error": "Email already registered.", "status_code": 400}

    result = await send_otp(email, db)
    if "error" in result:
        return {"error": result["error"], "status_code": 429}

    return {"message": "OTP sent. Please check your email."}

# Start login process by verifying credentials and sending OTP if valid
async def start_login(email: str, password: str, db: AsyncSession) -> dict:
    user = (await db.execute(select(User).where(User.email == email))).scalars().first()
    if not user or not verify_password(password, user.hashed_password):
        return {"error": "Invalid Credentials", "status_code": 401}

    result = await send_otp(email, db)
    if "error" in result:
        return {"error": result["error"], "status_code": 429}

    return {"message": "OTP sent. Please check your email."}

# Verify OTP and register user, returning JWT token on success
async def finish_signup(
    email: str,
    code: str,
    password: str,
    first_name: str,
    last_name: str,
    db: AsyncSession,
) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    block_error_result = await block_error(email, db, now)
    if block_error_result:
        return block_error_result

    otp, otp_error = await validate_otp(email, code, db, now)
    if otp_error:
        return otp_error

    # Mark OTP as used so it can't be reused
    await use_otp(otp, db, now)

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
    return _build_auth_response(new_user)

# Verify login OTP and return JWT token on success
async def finish_login(email: str, code: str, db: AsyncSession) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    block_error_result = await block_error(email, db, now)
    if block_error_result:
        return block_error_result

    otp, otp_error = await validate_otp(email, code, db, now)
    if otp_error:
        return otp_error

    await use_otp(otp, db, now)

    user = (await db.execute(select(User).where(User.email == email))).scalars().first()
    if not user:
        return {"error": "Invalid Credentials"}

    return _build_auth_response(user)