from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import engine, Base
from app.middleware import setup_cors, setup_error_handlers
from app.routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: dispose the engine
    await engine.dispose()


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


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
