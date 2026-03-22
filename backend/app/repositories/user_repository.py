from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user_schema import UserCreate


class UserRepository:
    """Handles all database operations for the User model."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: UserCreate, hashed_password: str) -> User:
        # Create new user with fields from payload and hashed password
        user = User(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            hashed_password=hashed_password,
        )
        # Add to session and commit
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> User | None:
        # Query user by user_id primary key
        result = await self.db.execute(select(User).where(User.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
