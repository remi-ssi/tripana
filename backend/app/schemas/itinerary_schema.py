from __future__ import annotations

from datetime import date as DateType
from datetime import time as TimeType
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class MealBreakInput(BaseModel):
    meal_type: str = Field(min_length=1, max_length=50)
    meal_time: TimeType
    enabled: bool = True


class ItineraryGenerateRequest(BaseModel):
    trip_type: Literal["day", "overnight"]
    city: str = Field(min_length=2, max_length=255)
    hotel: str | None = Field(default=None, max_length=255)
    date: DateType | None = None
    start_date: DateType | None = None
    end_date: DateType | None = None
    start_time: TimeType | None = None
    max_attractions: int | None = Field(default=None, ge=1, le=20)
    budget: Literal["budget-friendly", "balanced", "luxury"]
    pace_level: int = Field(default=2, ge=1, le=5)
    attraction_ids: list[str] = Field(min_length=1, max_length=100)
    include_breaks: bool = False
    meal_breaks: list[MealBreakInput] = Field(default_factory=list)
    trip_name: str | None = Field(default=None, max_length=255)
    hotel_lat: float | None = None  # Hotel latitude for route optimization
    hotel_lng: float | None = None  # Hotel longitude for route optimization

    @model_validator(mode="after")
    def validate_dates(self):
        if self.trip_type == "day":
            if not self.date or not self.start_time:
                raise ValueError("Day tours require date and start_time")
        else:
            if not self.start_date or not self.end_date:
                raise ValueError("Overnight trips require start_date and end_date")
            if self.end_date <= self.start_date:
                raise ValueError("end_date must be after start_date (overnight trips require at least 2 days)")
            if not self.hotel:
                raise ValueError("Overnight trips require a hotel or base")
        return self


class ActivityScheduleUpdate(BaseModel):
    activity_id: int
    start_time: TimeType
    status: Literal["planned", "visited"] = "planned"


class DayScheduleUpdate(BaseModel):
    day_id: int
    activities: list[ActivityScheduleUpdate] = Field(default_factory=list)


class BreakScheduleUpdate(BaseModel):
    break_id: int
    meal_type: str = Field(min_length=1, max_length=50)
    meal_time: TimeType


class ItineraryScheduleUpdate(BaseModel):
    days: list[DayScheduleUpdate]
    breaks: list[BreakScheduleUpdate] = Field(default_factory=list)
