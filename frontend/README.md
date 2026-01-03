# Dayflow (Frontend)

Simple React frontend for Dayflow HR system.

Features:
- React + Vite
- React Router DOM routing
- Context API for auth and role management (Employee / Admin)
- Mock APIs for attendance, leave, payroll
- Role-based protected routes

Run locally:
1. cd frontend
2. npm install
3. npm run dev

Sample accounts (mocked):
- Admin: admin@dayflow.com / adminpass
- Employee: eve@dayflow.com / evepass

Notes:
- Backend is mocked by default. To connect with the backend, set `VITE_API_URL` in `.env` to your backend URL (e.g. `http://localhost:4000`).
- `src/services/mockApi.js` will call the real backend when `VITE_API_URL` is set. Dummy data is used as a fallback and can be edited in `src/services/mockApi.js`.
- Admins can view all registered users at `/admin/users` once logged in.
