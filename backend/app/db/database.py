import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Add it to backend/.env before starting the app."
        )
    return database_url


engine = create_engine(get_database_url())

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
