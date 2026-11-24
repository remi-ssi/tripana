import sys
from pathlib import Path

import pytest
from fastapi import HTTPException

backend_path = Path(__file__).parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.services import google_places_service


class MockResponse:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class MockAsyncClient:
    calls = 0

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    async def get(self, *args, **kwargs):
        self.__class__.calls += 1
        if self.__class__.calls == 1:
            return MockResponse(
                {
                    "status": "OK",
                    "results": [
                        {
                            "place_id": "place-1",
                            "name": "Test Place",
                            "formatted_address": "Manila",
                            "geometry": {"location": {"lat": 14.5, "lng": 121.0}},
                            "types": ["tourist_attraction"],
                        }
                    ],
                    "next_page_token": "delayed-token",
                }
            )

        return MockResponse({"status": "INVALID_REQUEST", "results": []})


class DeniedAsyncClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    async def get(self, *args, **kwargs):
        return MockResponse(
            {
                "status": "REQUEST_DENIED",
                "error_message": "You must enable Billing on the Google Cloud Project.",
                "results": [],
            }
        )


@pytest.mark.asyncio
async def test_search_keeps_first_page_when_next_page_token_stays_delayed(monkeypatch):
    MockAsyncClient.calls = 0
    monkeypatch.setattr(google_places_service.httpx, "AsyncClient", MockAsyncClient)
    monkeypatch.setattr(google_places_service, "track_api_request", lambda: True)
    monkeypatch.setattr(google_places_service.settings, "GOOGLE_PLACES_API_KEY", "test-key")

    async def no_sleep(_seconds):
        return None

    monkeypatch.setattr("asyncio.sleep", no_sleep)

    results = await google_places_service.search_attractions(
        query="historical sites in Manila",
        limit=50,
    )

    assert len(results) == 1
    assert results[0]["id"] == "place-1"
    assert MockAsyncClient.calls == 5


@pytest.mark.asyncio
async def test_search_includes_google_error_message(monkeypatch):
    monkeypatch.setattr(google_places_service.httpx, "AsyncClient", DeniedAsyncClient)
    monkeypatch.setattr(google_places_service, "track_api_request", lambda: True)
    monkeypatch.setattr(google_places_service.settings, "GOOGLE_PLACES_API_KEY", "test-key")

    with pytest.raises(HTTPException) as exc_info:
        await google_places_service.search_attractions(query="hiking in Baguio")

    assert exc_info.value.status_code == 400
    assert "REQUEST_DENIED" in exc_info.value.detail
    assert "enable Billing" in exc_info.value.detail
