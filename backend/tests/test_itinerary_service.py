from datetime import datetime, time
from app.schemas.itinerary_schema import ItineraryGenerateRequest
from app.services.itinerary_service import ItineraryService


def test_day_request_requires_date_and_time():
    try:
        ItineraryGenerateRequest(
            trip_type="day",
            city="Cebu",
            budget="balanced",
            attraction_ids=["place-1"],
        )
    except ValueError as error:
        assert "date and start_time" in str(error)
    else:
        raise AssertionError("Invalid day request was accepted")


def test_break_overlap_moves_visit_after_break():
    start = datetime(2026, 7, 1, 11, 0)
    adjusted = ItineraryService._move_after_overlapping_break(
        start,
        120,
        [datetime(2026, 7, 1, 12, 0)],
    )
    assert adjusted == datetime(2026, 7, 1, 13, 0)


def test_display_time_round_trip_format():
    assert ItineraryService._format_time(time(8, 5)) == "08:05 AM"
