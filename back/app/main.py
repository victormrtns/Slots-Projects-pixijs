import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes import history, player, spin, stats

load_dotenv()

app = FastAPI(title="Slot Backend", version="1.0.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(spin.router, tags=["spin"])
app.include_router(history.router, tags=["history"])
app.include_router(stats.router, tags=["stats"])
app.include_router(player.router, tags=["player"])
