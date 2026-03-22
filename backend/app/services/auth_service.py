# backend/app/services/auth_service.py

import random
import string
from datetime import datetime, timedelta
from jose import jwt                     # pip install python-jose
from passlib.context import CryptContext # pip install passlib
from sqlalchemy.orm import Session
from app.models.otp import OTPCode
from app.models.user import User
from app.config import settings
from app.services.email_service import send_otp_email

pwd_context = CryptContext(schemes=["bcrypt"])  # for hashing passwords

OTP_EXPIRE_MINUTES = 10   # OTP dies after 10 minutes
RESEND_WAIT_SECONDS = 120 # user must wait 2 minutes before resending

#generate a random 6-digit OTP code
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

#send OTP email and save code to DB, enforcing resend cooldown
def send_registration_otp(email: str, db: Session) -> dict:
    # Check if a recent OTP already exists (resend cooldown)
    recent_otp = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.is_used == False,
        OTPCode.created_at >= datetime.utcnow() - timedelta(seconds=RESEND_WAIT_SECONDS)
    ).first()

    # If there's a recent OTP, tell user to wait before resending
    if recent_otp:
        wait_seconds = int(
            (recent_otp.created_at + timedelta(seconds=RESEND_WAIT_SECONDS)
             - datetime.utcnow()).total_seconds()
        )
        return {"error": f"Please wait {wait_seconds} seconds before resending."}

    # Invalidate all previous unused OTPs for this email
    db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.is_used == False
    ).update({"is_used": True})
    db.commit()

    # Create new OTP
    code = generate_otp()
    otp = OTPCode(
        email=email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    )
    db.add(otp)
    db.commit()

    # Send email
    send_otp_email(email, code)
    return {"message": "OTP sent to email."}

# Verify OTP and register user, returning JWT token on success
def verify_otp_and_register(email: str, code: str, password: str, full_name: str, db: Session) -> dict:
    # Find the latest unused, non-expired OTP for this email
    otp = db.query(OTPCode).filter(
        OTPCode.email == email,
        OTPCode.code == code,
        OTPCode.is_used == False,
        OTPCode.expires_at > datetime.utcnow()
    ).order_by(OTPCode.created_at.desc()).first()

    if not otp:
        return {"error": "Invalid or expired code."}

    # Mark OTP as used so it can't be reused
    otp.is_used = True
    db.commit()

    # Check if user already exists (edge case)
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return {"error": "Email already registered."}

    # Save new user
    new_user = User(
        email=email,
        hashed_password=pwd_context.hash(password),
        full_name=full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create JWT token
    token_data = {"sub": str(new_user.id), "email": new_user.email}
    token = jwt.encode(token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}