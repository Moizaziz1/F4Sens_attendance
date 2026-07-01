from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, insert, delete, func
from typing import List, Optional
from datetime import date, datetime

from ..dependencies import admin_required, get_current_user
from ..auth import get_password_hash
from ..db import get_db
from ..models.user import User, Attendance, Notification
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/admin", tags=["admin"])

# ---------- Stats ----------
class StatsResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    late_today: int

@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db), _: User = Depends(admin_required)):
    total = await db.scalar(select(func.count()).select_from(User).where(User.role == "employee"))
    today = date.today()
    present = await db.scalar(select(func.count()).where(Attendance.date == today, Attendance.status == "present"))
    absent = await db.scalar(select(func.count()).where(Attendance.date == today, Attendance.status == "absent"))
    late = await db.scalar(select(func.count()).where(Attendance.date == today, Attendance.status == "late"))
    return StatsResponse(total_employees=total or 0, present_today=present or 0, absent_today=absent or 0, late_today=late or 0)

# ---------- Employees ----------
class EmployeeResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    department: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

@router.get("/employees", response_model=List[EmployeeResponse])
async def list_employees(db: AsyncSession = Depends(get_db), _: User = Depends(admin_required)):
    result = await db.execute(select(User).where(User.role == "employee"))
    users = result.scalars().all()
    return [EmployeeResponse(
        id=str(u.id),
        name=u.name,
        email=u.email,
        department=u.department,
        role=u.role,
        is_active=u.is_active,
        created_at=u.created_at,
    ) for u in users]

class EmployeeCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    department: Optional[str]
    role: str = Field(default="employee")
    is_active: bool = True

@router.post("/employees", status_code=201)
async def create_employee(req: EmployeeCreateRequest, db: AsyncSession = Depends(get_db), _: User = Depends(admin_required)):
    # Check email uniqueness
    exists = await db.scalar(select(User.id).where(User.email == req.email))
    if exists:
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed = get_password_hash(req.password)
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=hashed,
        role=req.role,
        department=req.department,
        is_active=req.is_active,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "Employee created", "id": str(new_user.id)}

class EmployeeUpdateRequest(BaseModel):
    name: Optional[str]
    department: Optional[str]
    is_active: Optional[bool]
    role: Optional[str]

@router.patch("/employees/{employee_id}")
async def update_employee(employee_id: str, req: EmployeeUpdateRequest, db: AsyncSession = Depends(get_db), _: User = Depends(admin_required)):
    result = await db.execute(select(User).where(User.id == employee_id, User.role == "employee"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    if req.name is not None:
        user.name = req.name
    if req.department is not None:
        user.department = req.department
    if req.is_active is not None:
        user.is_active = req.is_active
    if req.role is not None:
        user.role = req.role
    db.add(user)
    await db.commit()
    return {"message": "Employee updated"}

# ---------- Attendance Admin ----------
class AttendanceRecordResponse(BaseModel):
    id: str
    user_id: str
    date: date
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: str
    note: Optional[str]

@router.get("/attendance", response_model=List[AttendanceRecordResponse])
async def admin_attendance(
    user_id: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(admin_required),
):
    stmt = select(Attendance)
    if user_id:
        stmt = stmt.where(Attendance.user_id == user_id)
    if from_date:
        stmt = stmt.where(Attendance.date >= from_date)
    if to_date:
        stmt = stmt.where(Attendance.date <= to_date)
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [AttendanceRecordResponse(
        id=str(r.id),
        user_id=str(r.user_id),
        date=r.date,
        check_in=r.check_in,
        check_out=r.check_out,
        status=r.status,
        note=r.note,
    ) for r in rows]

class AttendanceUpdateRequest(BaseModel):
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: Optional[str]
    note: Optional[str]

@router.patch("/attendance/{attendance_id}")
async def update_attendance(attendance_id: str, req: AttendanceUpdateRequest, db: AsyncSession = Depends(get_db), _: User = Depends(admin_required)):
    result = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    att = result.scalar_one_or_none()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if req.check_in is not None:
        att.check_in = req.check_in
    if req.check_out is not None:
        att.check_out = req.check_out
    if req.status is not None:
        att.status = req.status
    if req.note is not None:
        att.note = req.note
    db.add(att)
    await db.commit()
    return {"message": "Attendance record updated"}

# ---------- Manual notification trigger ----------
@router.post("/trigger-notify")
async def trigger_notify_endpoint(db: AsyncSession = Depends(get_db), _: User = Depends(admin_required)):
    # Placeholder – real logic lives in scheduler module
    from ..scheduler import run_missed_attendance_notifications
    await run_missed_attendance_notifications(db)
    return {"message": "Manual notification run completed"}
