import os
from sqlmodel import SQLModel, create_engine, Session

_FLY_VOLUME = "/data"
_DEFAULT_DATA_DIR = (
    _FLY_VOLUME
    if os.path.isdir(_FLY_VOLUME) and os.access(_FLY_VOLUME, os.W_OK)
    else os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
)
DATA_DIR = os.environ.get("DATA_DIR", _DEFAULT_DATA_DIR)
os.makedirs(DATA_DIR, exist_ok=True)

DB_PATH = os.environ.get("DB_PATH", os.path.join(DATA_DIR, "app.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    # Import models so SQLModel picks them up before create_all.
    from app import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    with Session(engine) as session:
        yield session
