from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime, date, time, timezone, timedelta
from zoneinfo import ZoneInfo

from dependencies import get_current_user
from db import get_db
from models.user import Attendance, User
from pydantic import BaseModel, ConfigDict
from typing import Optional

router = APIRouter(prefix="/attendance", tags=["attendance"])

PK_TZ = ZoneInfo("Asia/Karachi")

def pk_now() -> datetime:
    return datetime.now(PK_TZ)

def pk_today() -> date:
    return pk_now().date()

class CheckInRequest(BaseModel):
    timestamp: Optional[datetime] = None  # optional, defaults to now on server side

class CheckOutRequest(BaseModel):
    timestamp: Optional[datetime] = None

class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    date: date
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: str
    note: Optional[str]

@router.post("/checkin", status_code=201)
async def check_in(req: CheckInRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    today = pk_today()
    # Prevent multiple check‑ins
    result = await db.execute(select(Attendance).where(and_(Attendance.user_id == user.id, Attendance.date == today)))
    existing = result.scalar_one_or_none()
    if existing and existing.check_in:
        raise HTTPException(status_code=400, detail="Already checked in today")
    timestamp = req.timestamp or pk_now()
    status_val = "late" if timestamp.time() > time(9, 0) else "present"
    if existing:
        existing.check_in = timestamp
        existing.status = status_val
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        att = existing
    else:
        att = Attendance(
            user_id=user.id,
            date=today,
            check_in=timestamp,
            status=status_val,
        )
        db.add(att)
        await db.commit()
        await db.refresh(att)
    return {"message": "Check‑in recorded", "attendance_id": str(att.id)}

@router.post("/checkout", status_code=200)
async def check_out(req: CheckOutRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    today = pk_today()
    result = await db.execute(select(Attendance).where(and_(Attendance.user_id == user.id, Attendance.date == today)))
    att = result.scalar_one_or_none()
    if not att or not att.check_in:
        raise HTTPException(status_code=400, detail="Check‑in required before check‑out")
    if att.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")
    timestamp = req.timestamp or pk_now()
    att.check_out = timestamp
    db.add(att)
    await db.commit()
    await db.refresh(att)
    return {"message": "Check‑out recorded", "attendance_id": str(att.id)}

@router.get("/today", response_model=AttendanceResponse)
async def get_today_attendance(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    today = pk_today()
    result = await db.execute(select(Attendance).where(and_(Attendance.user_id == user.id, Attendance.date == today)))
    att = result.scalar_one_or_none()
    if not att:
        # Return default absent record without persisting
        return AttendanceResponse(
            id="",
            date=today,
            check_in=None,
            check_out=None,
            status="absent",
            note=None,
        )
    return AttendanceResponse(
        id=str(att.id),
        date=att.date,
        check_in=att.check_in,
        check_out=att.check_out,
        status=att.status,
        note=att.note,
    )
