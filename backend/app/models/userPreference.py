from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String
from app.database import Base
from app.models.category import Category


class UserPreference(Base):
    __tablename__ = "user_preferences"

    preference_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.category_id"),
        nullable=False,
    )
    preferred_categories: Mapped[str] = mapped_column(String(255))

    # Relationship back to User
    user: Mapped["User"] = relationship("User", back_populates="preferences")
    category: Mapped["Category"] = relationship("Category", back_populates="users")
