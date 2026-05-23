"""
Place model representing attractions stored in the database for local search capability.
This model allows caching of Google Places API results to reduce API calls and provide faster search.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, Text, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Place(Base):
    """
    Represents an attraction/place fetched from Google Places API.
    Indexed on place_id (unique), city (for city filtering), and types (for preference matching).
    """
    __tablename__ = "places"

    place_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    google_place_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    
    # Coordinates
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Ratings and reviews
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    user_ratings_total: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Types (stored as JSON array for flexibility)
    types: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    
    # Additional details
    opening_hours: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photos: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    price_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Metadata
    date_created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    date_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for efficient searching
    __table_args__ = (
        Index("idx_city_types", "city", "types", postgresql_using="gin"),
        Index("idx_google_place_id", "google_place_id"),
        Index("idx_city", "city"),
    )
