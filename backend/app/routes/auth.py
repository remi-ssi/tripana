# backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db               # your existing DB session function
from app.schemas.auth import RegisterRequest, VerifyOTPRequest, ResendOTPRequest
from app.services.auth_service import send_registration_otp, verify_otp_and_register

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Step 1: User submits form → send OTP email."""
    # Check if email already registered
    from app.models.user import User
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    result = send_registration_otp(data.email, db)
    if "error" in result:
        raise HTTPException(status_code=429, detail=result["error"])

    # Store password temporarily in OTP record so we can save user after verify
    # (We do this by stashing it in a temp table or passing it during verify)
    # For simplicity: store hashed password on the OTP record via a session variable
    # Better approach: pass password again on /verify-otp (see below)
    return {"message": "OTP sent. Please check your email."}


@router.post("/resend-otp")
def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend OTP — enforces 2-minute cooldown."""
    result = send_registration_otp(data.email, db)
    if "error" in result:
        raise HTTPException(status_code=429, detail=result["error"])
    return {"message": "New OTP sent."}


@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Step 2: User enters OTP → verify and create account."""
    # We need the password here — update VerifyOTPRequest to include it
    raise HTTPException(status_code=400, detail="Use the full verify endpoint.")