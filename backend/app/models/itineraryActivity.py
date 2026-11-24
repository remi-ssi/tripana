from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ItineraryActivity(Base):
    __tablename__ = "itineraryactivity"

    activityid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dayid: Mapped[int] = mapped_column(ForeignKey("itinerarydays.dayid"), nullable=False)
    place: Mapped[int] = mapped_column(ForeignKey("places.placeid"), nullable=False)
    starttime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    endtime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    visitorder: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    day: Mapped["ItineraryDays"] = relationship("ItineraryDays", back_populates="activities")
    place_detail: Mapped["Place"] = relationship("Place")
