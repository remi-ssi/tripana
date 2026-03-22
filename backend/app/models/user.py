# This file defines the User model for the application, representing users in the database.
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.userPreference import UserPreference


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    date_created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    date_deleted: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationship to preferences
    preferences: Mapped[List["UserPreference"]] = relationship(
        "UserPreference",
        back_populates="user",
        cascade="all, delete-orphan"
    )   
