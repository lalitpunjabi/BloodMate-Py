from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "BloodMate API"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # PostgreSQL on AWS RDS is the only supported database target.
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        supported_prefixes = ("postgresql://", "postgresql+psycopg2://")
        if not value.lower().startswith(supported_prefixes):
            raise ValueError(
                "DATABASE_URL must point to a PostgreSQL database. "
                "Example: postgresql://user:password@host:5432/dbname"
            )
        return value

settings = Settings()
