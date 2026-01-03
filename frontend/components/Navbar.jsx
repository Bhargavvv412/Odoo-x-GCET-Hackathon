import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ui/ThemeToggle.jsx'
import Button from './ui/Button.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="brand">Dayflow</div>
      <div className="links">
        {user ? (
          <>
            <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Profile</NavLink>
            <NavLink to="/attendance" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Attendance</NavLink>
            <NavLink to="/leave" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Leave</NavLink>
            <NavLink to="/payroll" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Payroll</NavLink>
            {user.role === 'admin' && <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Admin</NavLink>}
            {user.role === 'employee' && <NavLink to="/employee" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>}
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Login</NavLink>
            <NavLink to="/register" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
