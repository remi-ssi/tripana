from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database import get_db
from app.models.user import User

# Authentication utilities for JWT token handling and user retrieval
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/verify-login-otp", auto_error=False)

# Helper function to determine if secure cookies should be used
def _use_secure_cookie() -> bool:
    return settings.AUTH_COOKIE_SECURE or settings.APP_ENV.lower() == "production"

# Function to create a JWT access token with an expiration time
def create_access_token(data: dict) -> str:
    payload = data.copy()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expires_at})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# Functions to set and clear the authentication cookie in the response
def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=_use_secure_cookie(),
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

# Clear the authentication cookie by setting it to expire immediately
def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        httponly=True,
        secure=_use_secure_cookie(),
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )

# Dependency to get the current authenticated user based on the JWT token
async def get_current_user(
    request: Request,
    bearer_token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = bearer_token or request.cookies.get(settings.AUTH_COOKIE_NAME)
    # If no token is provided, raise an authentication error
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode the JWT token and extract the user ID, then retrieve the user from the database
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_error
        user_id = int(user_id)
    except (JWTError, ValueError):
        raise credentials_error

    user = (await db.execute(select(User).where(User.user_id == user_id))).scalars().first()
    if not user:
        raise credentials_error

    return user
