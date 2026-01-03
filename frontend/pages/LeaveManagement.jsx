import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchLeaves, submitLeaveRequest } from '../services/mockApi'

export default function LeaveManagement() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const [type, setType] = useState('Paid')
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (user) fetchLeaves(user.id).then(setLeaves)
  }, [user])

  async function submit(e) {
    e.preventDefault()
    if (!from || !to) {
      alert('Please select both start and end dates')
      return
    }
    if (new Date(to) < new Date(from)) {
      alert('End date must be the same or after the start date')
      return
    }
    // convert date inputs (YYYY-MM-DD) to ISO timestamps
    const payload = { userId: user.id, from: new Date(from).toISOString(), to: new Date(to).toISOString(), reason, type, comment: remarks }
    const req = await submitLeaveRequest(payload)
    setLeaves((s) => [...s, req || { ...payload, id: Date.now(), status: 'Pending' }])
    setFrom(''); setTo(''); setReason(''); setType('Paid'); setRemarks('')
  }

  return (
    <div>
      <h2>Leave Management</h2>
      <div className="card">
        <h4>Apply for leave</h4>
        <form onSubmit={submit}>
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <label>To</label>
          <input type="date" min={from || undefined} value={to} onChange={(e) => setTo(e.target.value)} />
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Paid">Paid</option>
            <option value="Sick">Sick</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <label>Reason</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} />
          <label>Remarks (optional)</label>
          <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="button">Apply</button>
          </div>
        </form>
      </div>

      <h4>Your Requests</h4>
      <div className="grid">
        {leaves.map((l) => (
          <div className="card" key={l._id || l.id}>
            <p><strong>{l.type || 'Leave'}</strong> — {l.from ? new Date(l.from).toLocaleDateString() : l.from} → {l.to ? new Date(l.to).toLocaleDateString() : l.to}</p>
            <p>{l.reason}</p>
            {l.comment && <p className="small">Remarks: {l.comment}</p>}
            <p>Status: {l.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
