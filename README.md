# 🏢 Dayflow – Human Resource Management System (HRMS)

> Every workday, perfectly aligned.

Dayflow is a **full-stack MERN HRMS** designed to digitize and streamline core HR operations like **authentication, attendance, leave management, payroll, and employee profiles** with **role-based access control**.

---

## 🚀 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

---

## 👥 User Roles

| Role | Access |
|-----|-------|
| Admin / HR | Manage users, attendance, leave approvals, payroll |
| Employee | View profile, mark attendance, apply leave, view payroll |

---

## 🔐 Authentication & Authorization

- Email + Password login
- Email verification
- JWT-based authentication
- Role-based authorization (Admin vs Employee)

---

## 📦 Core Features

### 👤 User Management
- Register & Login
- Profile view/update
- Document upload
- Admin user control

### 🕒 Attendance
- Daily & weekly attendance
- Check-in / Check-out
- Admin view for all employees

### 🌴 Leave Management
- Apply leave (Paid / Sick / Unpaid)
- Leave status: Pending / Approved / Rejected
- Admin approval workflow

### 💰 Payroll
- Employee: read-only payroll view
- Admin: create/update payroll records

---

## 🛣️ API Routes Overview

### Auth Routes

- POST /api/auth/register
- GET /api/auth/verify
- POST /api/auth/login
- GET /api/auth/me


### Attendance Routes


- GET /api/attendance (Admin)
- GET /api/attendance/me
- GET /api/attendance/week
- POST /api/attendance/mark


### Leave Routes


- GET /api/leaves (Admin)
- GET /api/leaves/me
- POST /api/leaves
- PATCH /api/leaves/:id/status (Admin)


### Payroll Routes


- GET /api/payroll/me
- GET /api/payroll (Admin)
- POST /api/payroll (Admin)
- PATCH /api/payroll/:id (Admin)


### User Routes


- GET /api/users (Admin)
- GET /api/users/me
- PATCH /api/users/me
- POST /api/users/me/documents
- DELETE /api/users/me/documents/:index
- GET /api/users/:id (Admin)
- PATCH /api/users/:id (Admin)


---

## ⚙️ Environment Variables

Create a `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

▶️ Run Locally
Backend
cd backend
npm install
nodemon server.js

Frontend
cd frontend
npm install
npm run dev

📁 Project Structure
backend/
 ├─ controllers/
 ├─ models/
 ├─ routes/
 ├─ middleware/
 ├─ server.js

frontend/
 ├─ src/
 ├─ pages/
 ├─ components/
 ├─ services/

📈 Future Enhancements

Analytics dashboard

Salary slip PDF generation

Notifications (Email / In-app)

Role permissions granularity
