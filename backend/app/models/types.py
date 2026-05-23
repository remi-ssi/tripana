from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Types(Base):
    __tablename__ = "types"

    categoryid: Mapped[int] = mapped_column(ForeignKey("categories.category_id"), primary_key=True)
    category: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    category_detail: Mapped["Category"] = relationship("Category")
