from datetime import datetime
from typing import Optional, List
from sqlalchemy import DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ItineraryDays(Base):
    __tablename__ = "itinerarydays"

    dayid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    itineraryid: Mapped[int] = mapped_column(ForeignKey("itinerary.itineraryid"), nullable=False)
    daynumber: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    itinerary: Mapped["Itinerary"] = relationship("Itinerary", back_populates="days")
    activities: Mapped[List["ItineraryActivity"]] = relationship("ItineraryActivity", back_populates="day")
