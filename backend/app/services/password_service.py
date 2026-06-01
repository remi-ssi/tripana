import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.auth_service import (
	block_error,
	cleanup_old_used_otps,
	send_otp,
	use_otp,
	validate_otp,
)
from app.utils.security import hash_password, verify_password

RESET_TOKEN_EXPIRE_MINUTES = 15


@dataclass
class ResetTokenEntry:
	email: str
	created_at: datetime
	expires_at: datetime


@dataclass
class ResetTokenState:
	entries: list[ResetTokenEntry] = field(default_factory=list)


RESET_TOKEN_STORE: dict[str, ResetTokenState] = {}
RESET_TOKEN_STORE_LOCK = asyncio.Lock()


def _normalize_email(email: str) -> str:
	return email.strip().lower()


async def _cleanup_old_reset_tokens(now: datetime) -> None:
	"""Remove expired reset tokens."""
	async with RESET_TOKEN_STORE_LOCK:
		removable_emails = []
		for email, state in RESET_TOKEN_STORE.items():
			state.entries = [entry for entry in state.entries if entry.expires_at > now]
			if not state.entries:
				removable_emails.append(email)

		for email in removable_emails:
			RESET_TOKEN_STORE.pop(email, None)


async def _create_reset_token(email: str, now: datetime) -> None:
	"""Store a reset token server-side for the email (not returned to client)."""
	normalized_email = _normalize_email(email)
	async with RESET_TOKEN_STORE_LOCK:
		state = RESET_TOKEN_STORE.setdefault(normalized_email, ResetTokenState())
		# Invalidate any previous reset tokens
		state.entries = []
		# Create new token
		state.entries.append(
			ResetTokenEntry(
				email=normalized_email,
				created_at=now,
				expires_at=now + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
			)
		)


async def _has_valid_reset_token(email: str, now: datetime) -> bool:
	#Check if a valid reset token exists for this email."""
	normalized_email = _normalize_email(email)
	async with RESET_TOKEN_STORE_LOCK:
		state = RESET_TOKEN_STORE.get(normalized_email)
		if not state or not state.entries:
			return False
		return any(entry.expires_at > now for entry in state.entries)


async def _consume_reset_token(email: str) -> None:
	#Remove the reset token after use."""
	normalized_email = _normalize_email(email)
	async with RESET_TOKEN_STORE_LOCK:
		RESET_TOKEN_STORE.pop(normalized_email, None)


# Added: Forgot-password step 1: verify email exists, then send OTP using existing OTP logic.
async def start_forgot_password(email: str, db: AsyncSession) -> dict:
	user = (await db.execute(select(User).where(User.email == email))).scalars().first()
	if not user:
		return {"error": "User doesnt exists", "status_code": 404}

	result = await send_otp(email, db)
	if "error" in result:
		return {"error": result["error"], "status_code": 429}

	return {"message": "OTP sent. Please check your email."}


# Added: Forgot-password step 2: verify OTP, then store a reset token server-side (15 min validity).
async def verify_forgot_password_otp(email: str, code: str, db: AsyncSession) -> dict:
	now = datetime.now(timezone.utc)
	await cleanup_old_used_otps(db, now)
	await _cleanup_old_reset_tokens(now)

	block_error_result = await block_error(email, db, now)
	if block_error_result:
		return block_error_result

	otp, otp_error = await validate_otp(email, code, db, now)
	if otp_error:
		return otp_error

	await use_otp(otp, db, now)

	user = (await db.execute(select(User).where(User.email == email))).scalars().first()
	if not user:
		return {"error": "User doesnt exists", "status_code": 404}

	# Store reset token server-side; don't send it to frontend
	await _create_reset_token(email, now)

	return {"message": "OTP verified. You can now reset your password."}


# Added: Forgot-password step 3: reset password using server-side reset token (no token in URL).
async def reset_password_with_token(email: str, new_password: str, db: AsyncSession) -> dict:
	now = datetime.now(timezone.utc)
	await _cleanup_old_reset_tokens(now)

	# Check if user has a valid reset token
	if not await _has_valid_reset_token(email, now):
		return {"error": "Invalid or expired reset request. Please start over.", "status_code": 401}

	user = (await db.execute(select(User).where(User.email == email))).scalars().first()
	if not user:
		return {"error": "User doesnt exists", "status_code": 404}

	user.hashed_password = hash_password(new_password)
	await db.commit()

	# Consume the reset token so it can't be reused
	await _consume_reset_token(email)

	return {"message": "Password updated successfully."}


# Added: Logged-in flow: require old password, then update to new password.
async def change_password_authenticated(user: User, old_password: str, new_password: str, db: AsyncSession) -> dict:
	if not verify_password(old_password, user.hashed_password):
		return {"error": "Old password is incorrect.", "status_code": 400}

	user.hashed_password = hash_password(new_password)
	await db.commit()

	return {"message": "Password updated successfully."}
