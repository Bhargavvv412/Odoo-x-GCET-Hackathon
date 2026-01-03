import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { required } from '../utils/validators'
import { resendVerification } from '../services/mockApi'
import Button from '../components/ui/Button.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    const v1 = required(email)
    const v2 = required(password)
    if (v1 || v2) return setError(v1 || v2)
    try {
      const user = await login({ email, password })
      nav(user.role === 'admin' ? '/admin' : '/employee')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={submit} className="auth-form" aria-label="Login form">
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <div style={{ marginTop: 8 }}>
          {error && error.includes('Email not verified') && (
            <div style={{ marginBottom: 8 }}>
              <Button variant="secondary" onClick={async () => {
                try {
                  const res = await resendVerification(email)
                  alert(res.message + (res.token ? ` Dev token: ${res.token}` : ''))
                } catch (err) { alert(err.message) }
              }}>Resend verification</Button>
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="button">Login</button>
        </div>
      </form>
    </div>
  )
}
