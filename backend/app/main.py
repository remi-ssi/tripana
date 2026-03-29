import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.middleware import setup_cors, setup_error_handlers
from app.routes import api_router
from app.routes.auth import router as auth_router, legacy_router as legacy_auth_router
from app.services.auth_service import cleanup_old_used_otps


async def otp_cleanup_worker(stop_event: asyncio.Event):
    """Periodically hard-delete OTP rows whose deleted_at has passed."""
    while not stop_event.is_set():
        try:
            async with AsyncSessionLocal() as db:
                await cleanup_old_used_otps(db, datetime.now(timezone.utc))
        except Exception as e:
            print(f"Warning: OTP cleanup job failed: {e}")

        try:
            await asyncio.wait_for(
                stop_event.wait(), timeout=settings.OTP_CLEANUP_INTERVAL_SECONDS
            )
        except asyncio.TimeoutError:
            continue

@asynccontextmanager
async def lifespan(app: FastAPI):
    stop_event = asyncio.Event()
    cleanup_task = None

    # Startup: create database tables (if database is available)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        cleanup_task = asyncio.create_task(otp_cleanup_worker(stop_event))
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")
        print("Database will be available once it's set up.")
    
    yield
    
    # Shutdown: dispose the engine
    try:
        if cleanup_task:
            stop_event.set()
            await cleanup_task

        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.APP_DEBUG,
    lifespan=lifespan,
)

# Setup middleware
setup_cors(app)
setup_error_handlers(app)

# Include API routes
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(legacy_auth_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
