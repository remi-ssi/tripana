from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = BACKEND_ROOT.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPOSITORY_ROOT / ".env", BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )

    # Application settings
    APP_NAME: str = "Tripana"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000
    SECRET_KEY: str = "INSECURE-DEV-KEY-CHANGE-IN-PRODUCTION"

    # PostgreSQL for development and production
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/tripana"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    BACKEND_BASE_URL: str = "http://localhost:8000"

    # Email settings
    MAIL_HOST: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""      
    MAIL_PASSWORD: str = ""    
    MAIL_FROM: str = ""

    # JWT settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    AUTH_COOKIE_NAME: str = "access_token"
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_SAMESITE: str = "lax"

    # Google OAuth settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_PATH: str = "/auth/callback"

    # Mapbox settings
    MAPBOX_TOKEN: str = ""

    # Google Places API settings
    GOOGLE_PLACES_API_KEY: str = ""
    GOOGLE_PLACES_MONTHLY_QUOTA: int = 10_000  # Default: 10,000 requests/month (adjust based on your plan)

    # Runtime files
    RSA_PRIVATE_KEY_PATH: Path = BACKEND_ROOT / "keys" / "private_key.pem"
    RSA_PUBLIC_KEY_PATH: Path = BACKEND_ROOT / "keys" / "public_key.pem"
    USAGE_DATA_DIR: Path = BACKEND_ROOT / "runtime"

    # OTP settings
    OTP_CLEANUP_INTERVAL_SECONDS: int = 60

settings = Settings()
