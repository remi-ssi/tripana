from typing import TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.place import Place
    from app.models.types import Types


class PlaceTypes(Base):
    #Junction table linking Places to their Types."""
    __tablename__ = "placetypes"

    placeid: Mapped[int] = mapped_column(ForeignKey("places.placeid"), primary_key=True)
    categoryid: Mapped[int] = mapped_column(ForeignKey("types.categoryid"), primary_key=True)

    # Relationships
    place: Mapped["Place"] = relationship("Place", back_populates="place_types")
    category: Mapped["Types"] = relationship("Types", back_populates="place_types")