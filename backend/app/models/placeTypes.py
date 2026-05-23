from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PlaceTypes(Base):
    __tablename__ = "placetypes"

    placeid: Mapped[int] = mapped_column(ForeignKey("places.placeid"), primary_key=True)
    categoryid: Mapped[int] = mapped_column(ForeignKey("categories.category_id"), primary_key=True)

    # Relationships
    place: Mapped["Place"] = relationship("Place")
    category: Mapped["Category"] = relationship("Category")
