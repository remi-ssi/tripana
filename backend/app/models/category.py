#for user preferences related to categories
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.userPreference import UserPreference
from typing import List

class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # Relationship to preferences
    users: Mapped[List["UserPreference"]] = relationship(
        "UserPreference",
        back_populates="category",
        cascade="all, delete-orphan"
    )