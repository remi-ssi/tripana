# backend/app/services/auth_service.py

import random
import secrets
import string
import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.email_service import send_otp_email
from app.utils.auth import create_access_token
from app.utils.security import hash_password, verify_password

OTP_EXPIRE_MINUTES = 10   # OTP dies after 10 minutes
RESEND_WAIT_SECONDS = 120 # user must wait 2 minutes before resending
USED_OTP_RETENTION_DAYS = 1  # used OTPs are kept for 1 day then deleted
MAX_RESEND_ATTEMPTS = 5 # 5 resend attempts allowed per session before blocking
MAX_VERIFY_ATTEMPTS = 5 # 5 failed verification attempts allowed per session before blocking
VERIFY_BLOCK_MINUTES = 15 # 15 minute block after too many failed attempts


@dataclass
class InMemoryOTPCode:
    email: str
    hashed_code: str
    created_at: datetime
    expires_at: datetime
    is_used: bool = False
    attempts: int = 0


@dataclass
class OTPEmailState:
    entries: list[InMemoryOTPCode] = field(default_factory=list)
    blocked_until: Optional[datetime] = None
    resend_count: int = 0
    last_sent_at: Optional[datetime] = None


OTP_STORE: dict[str, OTPEmailState] = {}
OTP_STORE_LOCK = asyncio.Lock()

# Normalize email by stripping whitespace and converting to lowercase for consistent handling.
def _normalize_email(email: str) -> str:
    return email.strip().lower()

# Get active (not used, not expired) OTP entries for an email.
def _active_entries(state: OTPEmailState, now: datetime) -> list[InMemoryOTPCode]:
    return [entry for entry in state.entries if (not entry.is_used and entry.expires_at > now)]

# Cleanup old/expired in-memory OTP entries.
async def cleanup_old_used_otps(db: AsyncSession, now: datetime) -> None:
    del db
    cutoff = now - timedelta(days=USED_OTP_RETENTION_DAYS)

    async with OTP_STORE_LOCK:
        removable_emails = []
        for email, state in OTP_STORE.items():
            state.entries = [
                entry
                for entry in state.entries
                if (not entry.is_used and entry.expires_at > now)
                or (entry.is_used and entry.created_at > cutoff)
            ]

            if state.blocked_until and state.blocked_until <= now:
                state.blocked_until = None

            if not state.entries and not state.blocked_until:
                removable_emails.append(email)

        for email in removable_emails:
            OTP_STORE.pop(email, None)

# return active block timestamp for this email, or None.
async def get_block_until(email: str, db: AsyncSession, now: datetime):
    del db
    normalized_email = _normalize_email(email)
    async with OTP_STORE_LOCK:
        state = OTP_STORE.get(normalized_email)
        if not state or not state.blocked_until:
            return None

        if state.blocked_until <= now:
            state.blocked_until = None
            return None

        return state.blocked_until

# Check if user is currently blocked due to too many attempts, and return error message if so.
async def block_error(email: str, db: AsyncSession, now: datetime):
    blocked_until = await get_block_until(email, db, now)
    if not blocked_until:
        return None

    wait_seconds = int((blocked_until - now).total_seconds())
    wait_minutes = max(1, (wait_seconds + 59) // 60)
    return {"error": f"Too many attempts. Try again in {wait_minutes} minutes."}

# Validate the provided OTP code for the email, returning the OTP object if valid or an error message if not.
async def validate_otp(email: str, code: str, db: AsyncSession, now: datetime):
    del db
    normalized_email = _normalize_email(email)

    async with OTP_STORE_LOCK:
        state = OTP_STORE.get(normalized_email)
        if not state:
            return None, {"error": "Invalid or expired code."}

        otp_candidates = sorted(_active_entries(state, now), key=lambda item: item.created_at, reverse=True)
        otp = next((item for item in otp_candidates if verify_password(code, item.hashed_code)), None)

        if otp:
            return otp, None

        latest_otp = otp_candidates[0] if otp_candidates else None
        if latest_otp:
            latest_otp.attempts = (latest_otp.attempts or 0) + 1

        # Count failed attempts for active OTP session(s), regardless of elapsed time.
        attempt_count = int(sum(item.attempts for item in _active_entries(state, now)))

        if attempt_count >= MAX_VERIFY_ATTEMPTS:
            block_until = now + timedelta(minutes=VERIFY_BLOCK_MINUTES)
            state.blocked_until = block_until
            return None, {"error": f"Too many attempts. Verification blocked for {VERIFY_BLOCK_MINUTES} minutes."}

        return None, {"error": "Invalid or expired code."}

# Mark the OTP as used and set a deletion time so it can't be reused and will eventually be cleaned up.
async def use_otp(otp: InMemoryOTPCode, db: AsyncSession, now: datetime) -> None:
    del db, now
    otp.is_used = True

# Invalidate any active OTPs for the email, such as when user cancels out of the OTP flow.
async def cancel_active_otp(email: str, db: AsyncSession) -> dict:
    """Invalidate any active OTP entries when user exits OTP flow."""
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)
    normalized_email = _normalize_email(email)

    async with OTP_STORE_LOCK:
        state = OTP_STORE.get(normalized_email)
        if state:
            for entry in state.entries:
                entry.is_used = True
            state.entries = []
            state.resend_count = 0
            state.last_sent_at = None

    return {"message": "OTP session cancelled."}

# Build the authentication response containing the JWT token and user info.
def _build_auth_response(user: User) -> dict:
    token_data = {"sub": str(user.user_id), "email": user.email}
    token = create_access_token(token_data)
    return {
        "token": token,
        "user": {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        },
    }

# Create a reset token for the email, which can be used to verify password reset requests without exposing the token to the frontend.
async def login_or_register_google_user(
    *,
    email: str,
    first_name: str,
    last_name: str,
    db: AsyncSession,
) -> dict:
    user = (await db.execute(select(User).where(User.email == email))).scalars().first()

    if not user:
        generated_secret = secrets.token_urlsafe(32)
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            hashed_password=hash_password(generated_secret),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return _build_auth_response(user)

#generate a random 6-digit OTP code
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

#send OTP email and save code to in memory, enforcing resend cooldown
async def send_otp(email: str, db: AsyncSession, is_resend: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    await cleanup_old_used_otps(db, now)

    
    block_error_result = await block_error(email, db, now)
    if block_error_result:
        return block_error_result

    normalized_email = _normalize_email(email)
    # Record OTP generation and enforce resend limits/cooldown in-memory to prevent abuse and manage state.
    async with OTP_STORE_LOCK:
        state = OTP_STORE.setdefault(normalized_email, OTPEmailState())

        if is_resend and state.resend_count >= MAX_RESEND_ATTEMPTS:
            state.blocked_until = now + timedelta(minutes=VERIFY_BLOCK_MINUTES)
            return {"error": f"Resend limit reached. Verification blocked for {VERIFY_BLOCK_MINUTES} minutes."}

        # If there's a recent OTP, tell user to wait before resending (only for explicit resend).
        # Allow login/registration attempts to bypass this cooldown to improve UX.
        if is_resend and state.last_sent_at and state.last_sent_at >= now - timedelta(seconds=RESEND_WAIT_SECONDS):
            wait_seconds = int(
                (state.last_sent_at + timedelta(seconds=RESEND_WAIT_SECONDS) - now).total_seconds()
            )
            return {"error": f"Please wait {wait_seconds} seconds before resending."}

        # Invalidate all previous unused OTPs for this email.
        for entry in state.entries:
            if not entry.is_used:
                entry.is_used = True

        # Create new OTP.
        code = generate_otp()
        state.entries.append(
            InMemoryOTPCode(
                email=normalized_email,
                hashed_code=hash_password(code),
                created_at=now,
                expires_at=now + timedelta(minutes=OTP_EXPIRE_MINUTES),
            )
        )
        state.last_sent_at = now
        state.resend_count = state.resend_count + 1 if is_resend else 0

    # Send email
    try:
        send_otp_email(normalized_email, code)
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


