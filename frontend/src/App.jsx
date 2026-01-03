import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminLeaves from './pages/AdminLeaves.jsx' 
import Profile from './pages/Profile.jsx'
import Attendance from './pages/Attendance.jsx'
import LeaveManagement from './pages/LeaveManagement.jsx'
import Payroll from './pages/Payroll.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import NotFound from './pages/NotFound.jsx'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminRoute from './routes/AdminRoute.jsx'
import Navbar from './components/Navbar.jsx'

export default function App() {
  const { user } = useAuth()

  return (
    <div className="app-root">
      <Navbar />
      <main className="container">
        <div className="layout">
          <div className="content">
            <Routes>
              <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/leaves" element={<AdminRoute><AdminLeaves /></AdminRoute>} />

              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
              <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}
