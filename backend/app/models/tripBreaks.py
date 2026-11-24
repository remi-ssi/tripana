from datetime import time
from typing import Optional
from sqlalchemy import Integer, String, Boolean, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TripBreaks(Base):
    __tablename__ = "tripbreaks"

    breakid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tripid: Mapped[int] = mapped_column(ForeignKey("trip.tripid"), nullable=False)
    mealtype: Mapped[str] = mapped_column(String(255), nullable=False)
    mealtime: Mapped[time] = mapped_column(Time, nullable=False)
    isenabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    # Relationships
    trip: Mapped["Trip"] = relationship("Trip", back_populates="breaks")
