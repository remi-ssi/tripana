from datetime import datetime
from typing import Optional, List
from sqlalchemy import DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Itinerary(Base):
    __tablename__ = "itinerary"

    itineraryid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tripid: Mapped[int] = mapped_column(ForeignKey("trip.tripid"), nullable=False)
    datecreated: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="itineraries")
    days: Mapped[List["ItineraryDays"]] = relationship("ItineraryDays", back_populates="itinerary")
