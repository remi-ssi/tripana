# backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db               # your existing DB session function
from app.schemas.user_schema import (
    UserCreate,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest,
    VerifyLoginOTPRequest,
)
from app.services.auth_service import (
    send_otp,
    start_signup,
    finish_signup,
    finish_login,
    start_login,
)

router = APIRouter(prefix="/auth", tags=["auth"])
legacy_router = APIRouter(prefix="/api/v1", tags=["auth"])


async def _register_impl(data: UserCreate, db: AsyncSession):
    result = await start_signup(data.email, db)
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])
    return result


async def _resend_impl(data: ResendOTPRequest, db: AsyncSession):
    result = await send_otp(data.email, db, is_resend=True)
    if "error" in result:
        raise HTTPException(status_code=429, detail=result["error"])
    return {"message": "New OTP sent."}


async def _verify_impl(data: VerifyOTPRequest, db: AsyncSession):
    result = await finish_signup(
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


async def _login_impl(data: LoginRequest, db: AsyncSession):
    result = await start_login(data.email, data.password, db)
    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 400), detail=result["error"])

    return result


async def _verify_login_impl(data: VerifyLoginOTPRequest, db: AsyncSession):
    result = await finish_login(email=data.email, code=data.code, db=db)
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


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Step 1 login: validate credentials and send OTP to email."""
    return await _login_impl(data, db)


@legacy_router.post("/login")
async def login_legacy(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await _login_impl(data, db)


@router.post("/verify-login-otp")
async def verify_login(data: VerifyLoginOTPRequest, db: AsyncSession = Depends(get_db)):
    """Step 2 login: verify OTP and issue JWT token."""
    return await _verify_login_impl(data, db)


@legacy_router.post("/verify-login-otp")
async def verify_login_legacy(data: VerifyLoginOTPRequest, db: AsyncSession = Depends(get_db)):
    return await _verify_login_impl(data, db)