import os
from fastapi import APIRouter, Depends, HTTPException, Response
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import timedelta

from db import get_db
from auth import get_password_hash, verify_password, create_access_token
from models.user import User
from pydantic import BaseModel, EmailStr, Field
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    department: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", status_code=201)
async def register(req: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": req.email})
    if result.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(req.password)
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=hashed,
        role="employee",
        department=req.department,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    token = create_access_token({"sub": str(new_user.id)})
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", secure=False)
    return {"access_token": token, "token_type": "bearer", "message": "User registered successfully"}

@router.post("/login")
async def login(req: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM users WHERE email = :email"), {"email": req.email})
    user_row = result.mappings().fetchone()
    if not user_row:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    user = User(**dict(user_row))
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is deactivated")
    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax", secure=False)
    return {"access_token": token, "token_type": "bearer", "message": "Login successful"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="lax", secure=False)
    return {"message": "Logged out successfully"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "is_active": current_user.is_active,
    }
