import asyncio
import os
import sys

# Ensure the backend directory is on sys.path so absolute imports
# (from db, from auth, etc.) work both locally and in Docker.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine, Base
from sqlalchemy import text
from scheduler import start_scheduler

app = FastAPI(title="F4Sens Attendance Management API")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Support comma-separated FRONTEND_URL values (e.g. "https://app.vercel.app,https://hf.space")
extra_origins = [u.strip() for u in os.getenv("EXTRA_ORIGINS", "").split(",") if u.strip()]
allow_origins = [frontend_url, *extra_origins, "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
# Remove duplicate origins
allow_origins = list(dict.fromkeys(allow_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, attendance, reports, notifications, admin
app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(admin.router)

# Initialize scheduler for missed‑attendance notifications
start_scheduler(app)

# Create tables on startup
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    # Seed admin user if not exists
    from auth import get_password_hash
    from models.user import User
    from db import get_db
    async for session in get_db():
        result = await session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": "admin@f4sens.com"},
        )
        if not result.fetchone():
            admin_user = User(
                name="Admin",
                email="admin@f4sens.com",
                password_hash=get_password_hash("Admin@123"),
                role="admin",
                is_active=True,
            )
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
        break

# Run with: uvicorn backend.main:app --reload
