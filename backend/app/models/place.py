"""
Place model representing attractions stored in the database.
This model caches attraction details from Google Places API.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Place(Base):
    """
    Represents an attraction/place fetched from Google Places API.
    """
    __tablename__ = "places"

    placeid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    googleplaceid: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Coordinates
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Ratings and reviews
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    userratinqtotal: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Additional details
    pricelevel: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    openinghours: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_open_now: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phonenumber: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    photos: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Metadata
    datefetched: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, nullable=True)
    lastupdate: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)
    isactive: Mapped[bool] = mapped_column(Boolean, default=True)

