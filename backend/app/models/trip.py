from datetime import datetime
from typing import Optional, List
from sqlalchemy import DateTime, Integer, String, Boolean, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Trip(Base):
    __tablename__ = "trip"

    tripid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    userid: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    tripname: Mapped[str] = mapped_column(String(255), nullable=False)
    place: Mapped[int] = mapped_column(Integer, nullable=False)
    triptype: Mapped[str] = mapped_column(String(255), nullable=False)
    startdate: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    enddate: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    hotellocation: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    attractionsperday: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    budget: Mapped[str] = mapped_column(String(255), nullable=False)
    pacing: Mapped[str] = mapped_column(String(255), nullable=False)
    starttime: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    includebreaks: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    datecreated: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    deletedat: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="trips", foreign_keys=[userid])
    itineraries: Mapped[List["Itinerary"]] = relationship("Itinerary", back_populates="trip")
    breaks: Mapped[List["TripBreaks"]] = relationship("TripBreaks", back_populates="trip")
