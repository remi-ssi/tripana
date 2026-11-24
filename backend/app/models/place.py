from datetime import datetime
from typing import Optional, List
from sqlalchemy import DateTime, Float, Integer, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.placeTypes import PlaceTypes

from app.database import Base


class Place(Base):
    """Represents an attraction/place fetched from Google Places API."""
    __tablename__ = "places"

    placeid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    googleplaceid: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # Coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Ratings and reviews
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    userratingtotal: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Additional details
    pricelevel: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    openinghours: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_open_now: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phonenumber: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    photos: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array string

    # Metadata
    datefetched: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, nullable=True)
    lastupdate: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)
    isactive: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationship
    place_types: Mapped[List["PlaceTypes"]] = relationship("PlaceTypes", back_populates="place")