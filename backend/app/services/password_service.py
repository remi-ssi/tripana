from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
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


# Added: Create a short-lived token used only for password reset after OTP verification.
def _create_reset_token(email: str) -> str:
	payload = {
		"email": email,
		"purpose": "password_reset",
		"exp": datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
	}
	return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# Added: Validate reset token and return the email embedded in it.
def _decode_reset_token(reset_token: str) -> str | None:
	try:
		payload = jwt.decode(reset_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
	except JWTError:
		return None

	if payload.get("purpose") != "password_reset":
		return None

	email = payload.get("email")
	return str(email) if email else None


# Added: Forgot-password step 1: verify email exists, then send OTP using existing OTP logic.
async def start_forgot_password(email: str, db: AsyncSession) -> dict:
	user = (await db.execute(select(User).where(User.email == email))).scalars().first()
	if not user:
		return {"error": "User doesnt exists", "status_code": 404}

	result = await send_otp(email, db)
	if "error" in result:
		return {"error": result["error"], "status_code": 429}

	return {"message": "OTP sent. Please check your email."}


# Added: Forgot-password step 2: verify OTP, then issue a temporary reset token.
async def verify_forgot_password_otp(email: str, code: str, db: AsyncSession) -> dict:
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
		return {"error": "User doesnt exists", "status_code": 404}

	return {
		"message": "OTP verified.",
		"reset_token": _create_reset_token(email),
	}


# Added: Forgot-password step 3: update password using reset token.
async def reset_password_with_token(reset_token: str, new_password: str, db: AsyncSession) -> dict:
	email = _decode_reset_token(reset_token)
	if not email:
		return {"error": "Invalid or expired reset token.", "status_code": 401}

	user = (await db.execute(select(User).where(User.email == email))).scalars().first()
	if not user:
		return {"error": "User doesnt exists", "status_code": 404}

	user.hashed_password = hash_password(new_password)
	await db.commit()

	return {"message": "Password updated successfully."}


# Added: Logged-in flow: require old password, then update to new password.
async def change_password_authenticated(user: User, old_password: str, new_password: str, db: AsyncSession) -> dict:
	if not verify_password(old_password, user.hashed_password):
		return {"error": "Old password is incorrect.", "status_code": 400}

	user.hashed_password = hash_password(new_password)
	await db.commit()

	return {"message": "Password updated successfully."}
