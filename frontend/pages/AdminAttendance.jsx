import React, { useEffect, useState } from 'react'
import { authFetch } from '../services/mockApi'

export default function AdminAttendance() {
  const [rows, setRows] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('all')
  const [view, setView] = useState('daily')
  const [error, setError] = useState(null)

  useEffect(() => {
    authFetch('/api/users')
      .then(setUsers)
      .catch(() => {})
  }, [])

  useEffect(() => {
    // daily: fetch all attendance and derive today's records
    // weekly: use /api/attendance/week
    if (view === 'daily') {
      authFetch('/api/attendance')
        .then(setRows)
        .catch((e) => setError(e.message))
    } else {
      const q = selectedUser && selectedUser !== 'all' ? `?userId=${selectedUser}` : ''
      authFetch('/api/attendance/week' + q)
        .then(setRows)
        .catch((e) => setError(e.message))
    }
  }, [view, selectedUser])

  // helper: today's iso
  const todayIso = new Date().toISOString().slice(0,10)

  return (
    <div>
      <h2>Team Attendance</h2>
      {error && <div className="error">{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <div>
          <button className={`button ${view === 'daily' ? '' : 'ghost'}`} onClick={() => setView('daily')}>Daily</button>
          <button className={`button ${view === 'weekly' ? '' : 'ghost'}`} onClick={() => setView('weekly')}>Weekly</button>
        </div>
        <div style={{ marginLeft: 8 }}>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="input">
            <option value="all">All employees</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
      </div>

      {view === 'daily' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Hours</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && rows.length === 0 && <tr><td colSpan={5}>No records</td></tr>}
              {users.map(u => {
                const rec = rows.find(r => r.user && (r.user._id ? r.user._id === u._id : r.user === u._id) && (r.date ? (r.date.slice ? r.date.slice(0,10) : new Date(r.date).toISOString().slice(0,10)) === todayIso : false))
                return (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{rec ? new Date(rec.date).toLocaleDateString() : '-'}</td>
                    <td>{rec ? rec.status : '-'}</td>
                    <td>{rec ? rec.hours : '-'}</td>
                    <td>{rec ? rec.note : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'weekly' && (
        <>
          <h4>Week Records</h4>
          <div className="grid">
            {rows.map(r => (
              <div className="card" key={r._id}>
                <p><strong>{r.user?.name || 'User'}</strong></p>
                <p>{new Date(r.date).toLocaleDateString()}</p>
                <p>{r.status} — {r.hours}h</p>
                {r.checkIn && <p>In: {new Date(r.checkIn).toLocaleTimeString()}</p>}
                {r.checkOut && <p>Out: {new Date(r.checkOut).toLocaleTimeString()}</p>}
                <p>{r.note}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}