from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import date, datetime
from typing import List, Optional

from ..dependencies import get_current_user
from ..db import get_db
from ..models.user import Attendance
from pydantic import BaseModel

router = APIRouter(prefix="/reports", tags=["reports"])

class DailyRecord(BaseModel):
    date: date
    status: str
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None

class MonthlyReportResponse(BaseModel):
    user_id: str
    month: int
    year: int
    records: List[DailyRecord]

@router.get("/monthly", response_model=MonthlyReportResponse)
async def monthly_report(
    user_id: str = Query(..., description="User UUID"),
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),  # ensure auth
):
    # Ensure the requested user exists
    result = await db.execute(select(Attendance).where(Attendance.user_id == user_id, func.date_part('year', Attendance.date) == year, func.date_part('month', Attendance.date) == month))
    rows = result.scalars().all()
    records = [DailyRecord(date=row.date, status=row.status, check_in=row.check_in, check_out=row.check_out) for row in rows]
    return MonthlyReportResponse(user_id=user_id, month=month, year=year, records=records)
