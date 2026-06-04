from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.place import place
from app.models.types import types

from app.database import Base


class PlaceTypes(Base):
    """Junction table linking Places to their Types."""
    __tablename__ = "placetypes"

    placeid: Mapped[int] = mapped_column(ForeignKey("places.placeid"), primary_key=True)
    categoryid: Mapped[int] = mapped_column(ForeignKey("types.categoryid"), primary_key=True)

    # Relationships
    place: Mapped["place"] = relationship("Place", back_populates="place_types")
    category: Mapped["types"] = relationship("Types", back_populates="place_types")