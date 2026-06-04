from typing import List
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.placeTypes import PlaceTypes

from app.database import Base


class Types(Base):
    """Lookup table for Google Place type categories."""
    __tablename__ = "types"

    categoryid: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    # Relationship
    place_types: Mapped[List["PlaceTypes"]] = relationship("PlaceTypes", back_populates="category")