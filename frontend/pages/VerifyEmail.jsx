import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authFetch } from '../services/mockApi'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('Verifying...')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return setError('Missing token')
    authFetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => setMessage(res.message || 'Verified'))
      .catch((e) => setError(e.message))
  }, [searchParams])

  return (
    <div className="auth-card">
      <h2>Email verification</h2>
      {error ? <div className="error">{error}</div> : <div className="success">{message}</div>}
      <div style={{marginTop: '1rem'}}>
        <button onClick={() => nav('/login')}>Go to Login</button>
      </div>
    </div>
  )
}
