# F4sens Attendance Management System

## Overview
A full‑stack attendance management application built with:
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: FastAPI (Python) + APScheduler
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: BetterAuth (email/password sessions)

The system provides employee check‑in/out, monthly reports, missed‑attendance notifications, and an admin panel.

---

## Repository Structure
```
.
├─ backend/                 # FastAPI server
│   ├─ main.py
│   ├─ db.py
│   ├─ auth.py
│   ├─ dependencies.py
│   ├─ models/              # SQLAlchemy models
│   ├─ routers/             # API routes (auth, attendance, reports, notifications, admin)
│   ├─ scheduler.py         # Daily missed‑attendance notification job
│   └─ requirements.txt
├─ frontend/                # Next.js app
│   ├─ app/                  # App Router pages
│   │   ├─ layout.tsx
│   │   ├─ (auth)/login/page.tsx
│   │   ├─ (auth)/register/page.tsx
│   │   ├─ dashboard/...    # employee pages (dashboard, reports, notifications)
│   │   └─ admin/...         # admin pages (dashboard, employees, attendance, reports)
│   ├─ components/          # shared UI components
│   ├─ lib/                 # auth client & axios instance
│   ├─ tailwind.config.js
│   ├─ postcss.config.js
│   ├─ tsconfig.json
│   └─ package.json
├─ schema.sql               # PostgreSQL schema (Neon)
└─ README.md                # (this file)
```

---

## Prerequisites
- **Node.js** ≥ 20 (for the frontend)
- **Python** ≥ 3.11
- **Git**
- **Neon account** (or any PostgreSQL instance). The connection string must be in the form of a Neon URL.

---

## Environment Variables
### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000   # backend base URL
NEXTAUTH_SECRET=your_nextauth_secret
BETTER_AUTH_SECRET=your_better_auth_secret
```
> Replace the secret values with strong random strings.

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require&channel_binding=require
SECRET_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:3000
TIMEZONE=Asia/Karachi
```
- **DATABASE_URL** – Neon connection URL (include `sslmode=require`).
- **SECRET_KEY** – JWT signing secret.
- **FRONTEND_URL** – used for CORS configuration.
- **TIMEZONE** – timezone for the scheduler (default Asia/Karachi).

---

## Setup & Installation
### 1. Clone the repository
```bash
git clone <repo-url>
cd F4sens_attendance
```

### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
# copy .env template and fill values
cp .env.example .env   # (create this file if needed)
# Apply the database schema (once)
psql $DATABASE_URL -f ../schema.sql
# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The API will be reachable at `http://localhost:8000`.

### 3. Frontend
```bash
cd ../frontend
npm install
# copy env template
cp .env.local.example .env.local   # (create this file if needed)
npm run dev
```
The Next.js app runs at `http://localhost:3000`.

---

## Database Migration
The current implementation uses SQLAlchemy `create_all` on startup, which creates tables automatically if they do not exist. For production, consider using Alembic migrations:
```bash
pip install alembic
alembic init alembic   # then configure alembic.ini with DATABASE_URL
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

---

## Admin Account
On first server start the system seeds an admin account if it does not exist:
- **Email**: `admin@f4sens.com`
- **Password**: `Admin@123`
You can change the password later via the admin panel or directly in the database.

---

## Running the Scheduler
The APScheduler is started automatically when the FastAPI app launches (`start_scheduler(app)` in `main.py`). It runs daily at **22:00 PKT** and creates a notification for any active employee missing a check‑in for that day.

You can also trigger it manually via the admin endpoint:
```
POST /admin/trigger-notify
```

---

## Testing
- **Backend**: Use any HTTP client (`curl`, Postman, or the Swagger UI at `http://localhost:8000/docs`).
- **Frontend**: Open the app in the browser, register a new employee or log in with the seeded admin account.
- Verify check‑in/out flow, monthly report, notifications, and admin CRUD actions.

---

## Production Notes
- Replace `allow_origins=["*"]` in `main.py` with the actual frontend URL.
- Use a proper secret management solution (e.g., Vault, environment‑specific secret stores).
- Deploy the FastAPI app behind a production ASGI server (e.g., `uvicorn` + `gunicorn` or `hypercorn`).
- Serve the Next.js app with Vercel, Netlify, or a containerized environment.
- Enable HTTPS for both frontend and backend.

---

## License
MIT License – feel free to customize and extend.

---

**Enjoy building and managing attendance with F4sens!**
"# F4Sens_attendance" 
