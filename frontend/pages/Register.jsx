import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { required, passwordValid } from '../utils/validators'
import Button from '../components/ui/Button.jsx'

export default function Register() {
  const [employeeId, setEmployeeId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { register } = useAuth()
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const v1 = required(employeeId) || required(name) || required(email) || passwordValid(password)
    if (v1) return setError(v1)
    try {
      const res = await register({ employeeId, name, email, password, role })
      // backend returns message on successful registration and verification email
      if (res && res.message) {
        setSuccess(res.message)
        if (res.token) setSuccess((s) => s + ` Dev token: ${res.token}`)
        setTimeout(() => nav('/login'), 2500)
      } else {
        nav(res.role === 'admin' ? '/admin' : '/employee')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-card">
      <h2>Register</h2>
      <form onSubmit={submit} className="auth-form" aria-label="Register form">
        <label>Employee ID</label>
        <input className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
        <label>Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="small" style={{ marginTop: 6, marginBottom: 6 }}>Password must be 8+ characters and include upper and lower case letters, a number, and a special character.</div>
        <label>Role</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="admin">Admin / HR Officer</option>
        </select>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <div className="form-actions">
          <Button type="submit">Register</Button>
        </div>
      </form>
    </div>
  )
}
