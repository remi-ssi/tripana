from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
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

    # OTP settings
    OTP_CLEANUP_INTERVAL_SECONDS: int = 60

settings = Settings()
