from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.middleware import setup_cors, setup_error_handlers
from app.api.routes import api_router
from app.api.routes.auth import router as auth_router
from app.seeds.philippine_attractions import seed_philippine_attractions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables and ensure baseline Philippine attractions are seeded
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSessionLocal() as session:
            await seed_philippine_attractions(session)
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")
        print("Database will be available once it's set up.")
    
    yield
    
    # Shutdown: dispose the engine
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.APP_DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site=settings.AUTH_COOKIE_SAMESITE,
    https_only=settings.AUTH_COOKIE_SECURE or settings.APP_ENV.lower() == "production",
)

# Setup middleware
setup_cors(app)
setup_error_handlers(app)

# Include API routes
app.include_router(api_router)
app.include_router(auth_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
