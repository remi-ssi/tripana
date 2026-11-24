from __future__ import annotations

from datetime import date, datetime, time, timedelta
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.itinerary import Itinerary
from app.models.itineraryActivity import ItineraryActivity
from app.models.itineraryDays import ItineraryDays
from app.models.place import Place
from app.models.trip import Trip
from app.models.tripBreaks import TripBreaks
from app.repositories.itinerary_repository import ItineraryRepository
from app.schemas.itinerary_schema import (
    ItineraryGenerateRequest,
    ItineraryScheduleUpdate,
)


PACE_LABELS = {
    1: "Very Relaxed",
    2: "Relaxed",
    3: "Moderate",
    4: "Active",
    5: "Intense",
}

PACE_MINUTES = {
    1: (150, 30),
    2: (135, 25),
    3: (120, 20),
    4: (105, 15),
    5: (90, 15),
}


class ItineraryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ItineraryRepository(db)

    async def generate(
        self,
        payload: ItineraryGenerateRequest,
        user_id: int,
    ) -> dict:
        places = await self._resolve_places(payload.attraction_ids)
        start_date, end_date = self._trip_dates(payload)
        day_count = (end_date - start_date).days + 1
        per_day = payload.max_attractions or len(places)

        if len(places) > day_count * per_day:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"{len(places)} attractions exceed the trip capacity of "
                    f"{day_count * per_day}. Increase max attractions per day "
                    "or select fewer attractions."
                ),
            )

        # ── Route optimisation ───────────────────────────────────────────────
        # Build per-day batches then apply nearest-neighbour within each batch.
        place_batches: list[list] = []
        remaining = list(places)
        for day_offset in range(day_count):
            batch_size = min(per_day, len(remaining))
            batch = remaining[:batch_size]
            remaining = remaining[batch_size:]
            place_batches.append(batch)

        optimized_batches: list[list] = []
        for day_offset, batch in enumerate(place_batches):
            if payload.trip_type == "overnight" and payload.hotel_lat is not None and payload.hotel_lng is not None:
                # Overnight: each day starts from the place nearest the hotel
                optimized = self._optimize_route(
                    batch,
                    start_lat=payload.hotel_lat,
                    start_lng=payload.hotel_lng,
                )
            else:
                # Day tour: keep the first place as-is (AI best pick / highest SAW score),
                # then apply nearest-neighbour from it
                if batch and batch[0].latitude is not None and batch[0].longitude is not None:
                    first = batch[0]
                    rest = self._optimize_route(
                        batch[1:],
                        start_lat=first.latitude,
                        start_lng=first.longitude,
                    )
                    optimized = [first] + rest
                else:
                    optimized = batch
            optimized_batches.append(optimized)
        # ────────────────────────────────────────────────────────────────────

        now = datetime.utcnow()
        # Use the first place in the first optimised batch as the "anchor" place
        anchor_place = optimized_batches[0][0] if optimized_batches and optimized_batches[0] else places[0]
        trip = Trip(
            userid=user_id,
            tripname=payload.trip_name or self._default_trip_name(payload.city, payload.trip_type),
            place=anchor_place.placeid,
            triptype=payload.trip_type,
            startdate=datetime.combine(start_date, time.min),
            enddate=datetime.combine(end_date, time.min),
            hotellocation=payload.hotel,
            attractionsperday=per_day,
            budget=payload.budget,
            pacing=PACE_LABELS[payload.pace_level],
            starttime=datetime.combine(start_date, payload.start_time or time(8, 0)),
            includebreaks=payload.include_breaks,
            status="planned",
            datecreated=now,
        )
        self.db.add(trip)
        await self.db.flush()

        itinerary = Itinerary(tripid=trip.tripid, datecreated=now)
        self.db.add(itinerary)
        await self.db.flush()

        enabled_breaks = [
            item for item in payload.meal_breaks if payload.include_breaks and item.enabled
        ]
        for item in enabled_breaks:
            self.db.add(
                TripBreaks(
                    tripid=trip.tripid,
                    mealtype=item.meal_type,
                    mealtime=item.meal_time,
                    isenabled=True,
                )
            )

        visit_minutes, travel_minutes = PACE_MINUTES[payload.pace_level]
        start_clock = payload.start_time or time(8, 0)

        for day_offset, day_places in enumerate(optimized_batches):
            trip_date = start_date + timedelta(days=day_offset)
            day = ItineraryDays(
                itineraryid=itinerary.itineraryid,
                daynumber=day_offset + 1,
                date=datetime.combine(trip_date, time.min),
            )
            self.db.add(day)
            await self.db.flush()

            cursor = datetime.combine(trip_date, start_clock)
            meal_datetimes = sorted(
                datetime.combine(trip_date, item.meal_time) for item in enabled_breaks
            )

            for visit_order, place in enumerate(day_places, start=1):
                cursor = self._move_after_overlapping_break(
                    cursor,
                    visit_minutes,
                    meal_datetimes,
                )
                end_time = cursor + timedelta(minutes=visit_minutes)
                self.db.add(
                    ItineraryActivity(
                        dayid=day.dayid,
                        place=place.placeid,
                        starttime=cursor,
                        endtime=end_time,
                        visitorder=visit_order,
                        status="planned",
                    )
                )
                cursor = end_time + timedelta(minutes=travel_minutes)

        await self.db.commit()
        saved = await self.repo.get_owned(itinerary.itineraryid, user_id)
        return self._serialize(saved)

    async def get(self, itinerary_id: int, user_id: int) -> dict:
        itinerary = await self.repo.get_owned(itinerary_id, user_id)
        if not itinerary:
            raise HTTPException(status_code=404, detail="Itinerary not found")
        return self._serialize(itinerary)

    async def list(self, user_id: int, skip: int = 0, limit: int = 20) -> list[dict]:
        itineraries = await self.repo.list_owned(user_id, skip=skip, limit=limit)
        return [self._serialize_summary(item) for item in itineraries]

    async def update_schedule(
        self,
        itinerary_id: int,
        payload: ItineraryScheduleUpdate,
        user_id: int,
    ) -> dict:
        itinerary = await self.repo.get_owned(itinerary_id, user_id)
        if not itinerary:
            raise HTTPException(status_code=404, detail="Itinerary not found")

        owned_days = {day.dayid: day for day in itinerary.days}
        supplied_day_ids = {day.day_id for day in payload.days}
        if not supplied_day_ids.issubset(owned_days):
            raise HTTPException(status_code=400, detail="Invalid itinerary day")

        for day_update in payload.days:
            day = owned_days[day_update.day_id]
            owned_activities = {activity.activityid: activity for activity in day.activities}
            supplied_activity_ids = {
                activity.activity_id for activity in day_update.activities
            }
            if not supplied_activity_ids.issubset(owned_activities):
                raise HTTPException(status_code=400, detail="Invalid itinerary activity")

            for activity in day.activities:
                if activity.activityid not in supplied_activity_ids:
                    await self.db.delete(activity)

            trip_date = day.date.date()
            for order, activity_update in enumerate(day_update.activities, start=1):
                activity = owned_activities[activity_update.activity_id]
                duration = (activity.endtime - activity.starttime) if (
                    activity.starttime and activity.endtime
                ) else timedelta(hours=2)
                activity.starttime = datetime.combine(trip_date, activity_update.start_time)
                activity.endtime = activity.starttime + duration
                activity.visitorder = order
                activity.status = activity_update.status

        owned_breaks = {item.breakid: item for item in itinerary.trip.breaks}
        supplied_break_ids = {item.break_id for item in payload.breaks}
        if not supplied_break_ids.issubset(owned_breaks):
            raise HTTPException(status_code=400, detail="Invalid itinerary break")

        for item in itinerary.trip.breaks:
            if item.breakid not in supplied_break_ids:
                await self.db.delete(item)

        for break_update in payload.breaks:
            item = owned_breaks[break_update.break_id]
            item.mealtype = break_update.meal_type
            item.mealtime = break_update.meal_time
            item.isenabled = True

        itinerary.trip.includebreaks = bool(payload.breaks)
        await self.db.commit()
        saved = await self.repo.get_owned(itinerary_id, user_id)
        return self._serialize(saved)

    async def delete(self, itinerary_id: int, user_id: int) -> None:
        itinerary = await self.repo.get_owned(itinerary_id, user_id)
        if not itinerary:
            raise HTTPException(status_code=404, detail="Itinerary not found")

        day_ids = [day.dayid for day in itinerary.days]
        if day_ids:
            await self.db.execute(
                delete(ItineraryActivity).where(ItineraryActivity.dayid.in_(day_ids))
            )
            await self.db.execute(
                delete(ItineraryDays).where(ItineraryDays.dayid.in_(day_ids))
            )
        await self.db.execute(
            delete(TripBreaks).where(TripBreaks.tripid == itinerary.tripid)
        )
        await self.db.delete(itinerary)
        await self.db.delete(itinerary.trip)
        await self.db.commit()

    async def _resolve_places(self, attraction_ids: list[str]) -> list[Place]:
        unique_ids = list(dict.fromkeys(str(item) for item in attraction_ids))
        numeric_ids = [int(item) for item in unique_ids if item.isdigit()]
        result = await self.db.execute(
            select(Place).where(
                or_(
                    Place.googleplaceid.in_(unique_ids),
                    Place.placeid.in_(numeric_ids) if numeric_ids else False,
                )
            )
        )
        found = list(result.scalars().all())
        by_identifier = {str(place.placeid): place for place in found}
        by_identifier.update({place.googleplaceid: place for place in found})
        missing = [item for item in unique_ids if item not in by_identifier]
        if missing:
            raise HTTPException(
                status_code=400,
                detail="One or more selected attractions are no longer available",
            )
        return [by_identifier[item] for item in unique_ids]

    @staticmethod
    def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Return great-circle distance in kilometres between two lat/lng points."""
        from math import radians, sin, cos, sqrt, atan2
        R = 6371.0
        dlat = radians(lat2 - lat1)
        dlng = radians(lng2 - lng1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
        return R * 2 * atan2(sqrt(a), sqrt(1 - a))

    @staticmethod
    def _optimize_route(places: list, start_lat: float, start_lng: float) -> list:
        """
        Nearest-neighbour greedy route optimisation.

        Starting from (start_lat, start_lng), repeatedly pick the unvisited
        place closest to the current position.  Places that lack coordinates
        are appended at the end in their original order.
        """
        with_coords = [p for p in places if p.latitude is not None and p.longitude is not None]
        without_coords = [p for p in places if p.latitude is None or p.longitude is None]

        ordered: list = []
        cur_lat, cur_lng = start_lat, start_lng
        remaining = list(with_coords)

        while remaining:
            nearest = min(
                remaining,
                key=lambda p: ItineraryService._haversine(cur_lat, cur_lng, p.latitude, p.longitude),
            )
            ordered.append(nearest)
            cur_lat, cur_lng = nearest.latitude, nearest.longitude
            remaining.remove(nearest)

        return ordered + without_coords

    @staticmethod
    def _trip_dates(payload: ItineraryGenerateRequest) -> tuple[date, date]:
        if payload.trip_type == "day":
            return payload.date, payload.date
        return payload.start_date, payload.end_date

    @staticmethod
    def _default_trip_name(city: str, trip_type: str) -> str:
        suffix = "Day Tour" if trip_type == "day" else "Getaway"
        return f"{city} {suffix}"

    @staticmethod
    def _move_after_overlapping_break(
        start: datetime,
        visit_minutes: int,
        breaks: list[datetime],
    ) -> datetime:
        while True:
            end = start + timedelta(minutes=visit_minutes)
            overlap = False
            for break_time in breaks:
                break_end = break_time + timedelta(hours=1)
                if start < break_end and end > break_time:
                    start = break_end
                    overlap = True
                    break
            if not overlap:
                break
        return start

    def _serialize_summary(self, itinerary: Itinerary) -> dict:
        trip = itinerary.trip
        first_place = self._first_place(itinerary)
        activities = [
            activity
            for day in itinerary.days
            for activity in day.activities
        ]
        return {
            "id": itinerary.itineraryid,
            "tripName": trip.tripname,
            "destination": first_place.city if first_place else "",
            "tripType": "Day Tour" if trip.triptype == "day" else "Overnight",
            "dateStart": trip.startdate.date().isoformat() if trip.startdate else None,
            "dateEnd": trip.enddate.date().isoformat() if trip.enddate else None,
            "budget": trip.budget,
            "pacing": trip.pacing,
            "status": trip.status,
            "attractionCount": len(activities),
            "visitedCount": sum(
                activity.status == "visited" for activity in activities
            ),
            "createdAt": itinerary.datecreated.isoformat() if itinerary.datecreated else None,
        }

    def _serialize(self, itinerary: Itinerary) -> dict:
        summary = self._serialize_summary(itinerary)
        trip = itinerary.trip
        start_clock = trip.starttime.time() if trip.starttime else time(8, 0)
        breaks = [item for item in trip.breaks if item.isenabled]
        days = []

        for day in sorted(itinerary.days, key=lambda item: item.daynumber):
            trip_date = day.date.date()
            
            start_clock = trip.starttime.time() if trip.starttime else time(8, 0)
            earliest_item_time = start_clock
            for activity in day.activities:
                if activity.starttime.time() < earliest_item_time:
                    earliest_item_time = activity.starttime.time()
            for break_item in breaks:
                if break_item.mealtime < earliest_item_time:
                    earliest_item_time = break_item.mealtime

            items = [
                {
                    "id": f"depart-{day.dayid}",
                    "type": "depart",
                    "time": self._format_time(earliest_item_time),
                    "title": (
                        f"Depart from {trip.hotellocation}"
                        if trip.hotellocation
                        else "Start your trip"
                    ),
                    "sub": summary["destination"],
                    "visited": False,
                }
            ]

            for activity in sorted(
                day.activities,
                key=lambda item: (item.visitorder or 0, item.activityid),
            ):
                place = activity.place_detail
                items.append(
                    {
                        "id": f"activity-{activity.activityid}",
                        "activityId": activity.activityid,
                        "placeId": place.placeid,
                        "type": "attraction",
                        "time": self._format_time(activity.starttime.time()),
                        "endTime": self._format_time(activity.endtime.time()),
                        "title": place.destination,
                        "sub": self._place_subtitle(place),
                        "coordinates": {
                            "lat": place.latitude,
                            "lng": place.longitude,
                        }
                        if place.latitude is not None and place.longitude is not None
                        else None,
                        "visited": activity.status == "visited",
                    }
                )

            for item in breaks:
                items.append(
                    {
                        "id": f"break-{item.breakid}",
                        "breakId": item.breakid,
                        "type": "break",
                        "time": self._format_time(item.mealtime),
                        "title": item.mealtype.title(),
                        "sub": "Scheduled meal break",
                        "visited": False,
                    }
                )

            items.sort(
                key=lambda item: (
                    self._parse_display_time(item["time"]),
                    0 if item["type"] == "depart" else 1
                )
            )
            days.append(
                {
                    "id": day.dayid,
                    "day": day.daynumber,
                    "date": trip_date.strftime("%A, %B %d"),
                    "items": items,
                }
            )

        return {
            **summary,
            "hotel": trip.hotellocation,
            "startTime": self._format_time(start_clock),
            "includeBreaks": trip.includebreaks,
            "days": days,
        }

    @staticmethod
    def _first_place(itinerary: Itinerary) -> Place | None:
        for day in sorted(itinerary.days, key=lambda item: item.daynumber):
            if day.activities:
                return sorted(
                    day.activities,
                    key=lambda item: (item.visitorder or 0, item.activityid),
                )[0].place_detail
        return None

    @staticmethod
    def _place_subtitle(place: Place) -> str:
        details = [place.address]
        if place.rating:
            details.append(f"{place.rating:.1f} rating")
        return " | ".join(item for item in details if item)

    @staticmethod
    def _format_time(value: time) -> str:
        return datetime.combine(date.today(), value).strftime("%I:%M %p")

    @staticmethod
    def _parse_display_time(value: str) -> datetime:
        return datetime.strptime(value, "%I:%M %p")
