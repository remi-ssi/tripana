from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserCreate, UserRead
from app.utils.security import hash_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def create_user(self, payload: UserCreate) -> UserRead:
        existing = await self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )
        hashed = hash_password(payload.password)
        user = await self.repo.create(payload, hashed)
        return UserRead.model_validate(user)

    async def get_user(self, user_id: int) -> UserRead | None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            return None
        return UserRead.model_validate(user)

    async def authenticate_user(self, email: str, password: str):
        user = await self.repo.get_by_email(email)
        
        # User doesn't exist
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if password matches the hash stored in database
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Password is correct - return user
        return user