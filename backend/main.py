import sys
from pathlib import Path
from contextlib import asynccontextmanager

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine, Base
from routers import auth, attendance, admin, reports, notifications
from scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler(app)
    yield
    await engine.dispose()


app = FastAPI(title="F4Sens Attendance API", lifespan=lifespan)

import os
import re

FRONTEND_URL = os.getenv("FRONTEND_URL", "")

extra_origins = [o.strip() for o in FRONTEND_URL.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost:\d+|.*\.vercel\.app|.*\.hf\.space)",
    allow_origins=extra_origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(admin.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    return {"message": "F4Sens Attendance API is running"}
