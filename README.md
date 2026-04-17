# HR Management System (1Clik)

A full-stack HR management web application for handling employee directory, attendance tracking, leave management, and secure authentication.

## Project Overview

This project is a monorepo with separate frontend and backend apps:

- `frontend`: React + Vite dashboard UI
- `backend`: Express + MongoDB REST API

Core capabilities implemented today:

- Email/password signup with email verification flow
- Google OAuth login
- JWT-based authentication + role checks (`admin`, `employee`)
- Employee directory (list + create for admin)
- Attendance records + check-in endpoint
- Leave request management (submit + admin approve/reject)
- Dashboard summary cards for team health

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- Axios
- Tailwind CSS 4
- `@react-oauth/google`

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Nodemailer (Ethereal test mail)

## Folder Structure

```text
hr management/
|- backend/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- server.js
|  |- seed.js
|  |- wipe_data.js
|- frontend/
|  |- src/
|  |  |- pages/
|  |  |- components/
|  |  |- lib/
|  |- vite.config.js
|- package.json
```

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hrm
JWT_SECRET=replace_with_strong_secret
FRONTEND_URL=http://localhost:5173
BACKEND_BASE_URL=http://localhost:5000
```

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:5000
```

## Installation

From repo root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Run the Project

### Option 1: Start both apps together (recommended)

```bash
npm run dev
```

### Option 2: Start apps separately

```bash
npm run dev:backend
npm run dev:frontend
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Seed Demo Data

The backend includes a seeder that recreates users + sample HR data.

```bash
cd backend
node seed.js
```

After seeding:

- Admin user email: `admin@oneclick.com`
- Admin password: value from `SEED_ADMIN_PASSWORD` env, or fallback `admin123`

To wipe employee/attendance/leave data:

```bash
cd backend
node wipe_data.js
```

## API Summary

Base URL: `http://localhost:5000`

### Auth

- `POST /api/auth/register`
- `GET /api/auth/verify/:token`
- `POST /api/auth/login`
- `POST /api/auth/google`

### Employees

- `GET /api/employees` (auth required)
- `POST /api/employees` (admin only)

### Attendance

- `GET /api/attendance` (auth required)
- `POST /api/attendance/checkin` (auth required)

### Leaves

- `GET /api/leaves` (auth required)
- `POST /api/leaves` (auth required)
- `PUT /api/leaves/:id/status` (admin only)

## Auth & Roles

- JWT token is sent as `Authorization: Bearer <token>`.
- Frontend stores token/user in `localStorage`.
- Backend enforces:
  - `requireAuth` for protected API routes
  - `requireAdmin` for admin-only actions

## Current Notes

- Email verification uses Nodemailer Ethereal test account; preview URL is printed in backend logs.
- Dashboard `Analytics` route is placeholder (`Coming in v2.0`).
- Attendance page timer UI is local-state based; persisted check-in happens through API endpoint.

## Scripts Reference

### Root

- `npm run dev` - run frontend + backend concurrently
- `npm run dev:frontend` - run frontend only
- `npm run dev:backend` - run backend only

### Backend

- `npm run dev` - start with nodemon
- `npm run start` - start with node

### Frontend

- `npm run dev` - start Vite server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - ESLint

## License

ISC
