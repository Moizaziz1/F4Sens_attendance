import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager

sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env", override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine, Base
from routers import auth, attendance, admin, reports, notifications
from scheduler import start_scheduler


ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("FRONTEND_URL", "").split(",")
    if o.strip()
] + [
    "https://f4sens-attendance.vercel.app",
    "http://localhost:3000",
    "http://localhost:7860",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler(app)
    yield
    await engine.dispose()


app = FastAPI(title="F4Sens Attendance API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=False,
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
