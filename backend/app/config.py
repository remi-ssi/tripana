from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "Tripana"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000
    SECRET_KEY: str = "INSECURE-DEV-KEY-CHANGE-IN-PRODUCTION"

    # PostgreSQL for development and production
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/tripana_db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60


settings = Settings()
