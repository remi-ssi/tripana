# backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db               # your existing DB session function
from app.schemas.user_schema import UserCreate, VerifyOTPRequest, ResendOTPRequest
from app.services.auth_service import send_registration_otp, verify_otp_and_register
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])
legacy_router = APIRouter(prefix="/api/v1", tags=["auth"])


async def _register_impl(data: UserCreate, db: AsyncSession):
    existing = (await db.execute(select(User).where(User.email == data.email))).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    result = await send_registration_otp(data.email, db)
    if "error" in result:
        raise HTTPException(status_code=429, detail=result["error"])
    return {"message": "OTP sent. Please check your email."}


async def _resend_impl(data: ResendOTPRequest, db: AsyncSession):
    result = await send_registration_otp(data.email, db, is_resend=True)
    if "error" in result:
        raise HTTPException(status_code=429, detail=result["error"])
    return {"message": "New OTP sent."}


async def _verify_impl(data: VerifyOTPRequest, db: AsyncSession):
    result = await verify_otp_and_register(
        email=data.email,
        code=data.code,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
        db=db,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/register")
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Step 1: User submits form -> send OTP email."""
    return await _register_impl(data, db)


@legacy_router.post("/register")
async def register_legacy(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Backward compatible endpoint for older frontend clients."""
    return await _register_impl(data, db)


@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Resend OTP — enforces 2-minute cooldown."""
    return await _resend_impl(data, db)


@legacy_router.post("/resend-otp")
async def resend_otp_legacy(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    return await _resend_impl(data, db)


@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Step 2: User enters OTP → verify and create account."""
    return await _verify_impl(data, db)


@legacy_router.post("/verify-otp")
async def verify_otp_legacy(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    return await _verify_impl(data, db)