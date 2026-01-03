import React, { useEffect, useState } from 'react'
import { authFetch } from '../services/mockApi'

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([])
  const [error, setError] = useState(null)
  const [comments, setComments] = useState({})

  useEffect(() => {
    authFetch('/api/leave')
      .then(setLeaves)
      .catch((e) => setError(e.message))
  }, [])

  async function update(id, status) {
    try {
      const comment = comments[id] || ''
      const res = await authFetch(`/api/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, comment }) })
      setLeaves((s) => s.map((l) => (l._id === id ? res : l)))
    } catch (err) {
      setError(err.message)
    }
  }

  function setCommentFor(id, val) {
    setComments((c) => ({ ...c, [id]: val }))
  }

  return (
    <div>
      <h2>Leave Requests</h2>
      {error && <div className="error">{error}</div>}
      <div className="grid">
        {leaves.map((l) => (
          <div className="card" key={l._id}>
            <p><strong>{l.user?.name || l.user}</strong></p>
            <p>{new Date(l.from).toLocaleDateString()} → {new Date(l.to).toLocaleDateString()}</p>
            <p><strong>Type:</strong> {l.type || 'Paid'}</p>
            <p>{l.reason}</p>
            {l.comment && <p className="small">Admin note: {l.comment}</p>}
            <p>Status: <span className="badge">{l.status}</span></p>
            <div style={{ marginTop: 8 }}>
              <input placeholder="Add comment (optional)" value={comments[l._id] || ''} onChange={(e) => setCommentFor(l._id, e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button" onClick={() => update(l._id, 'Approved')}>Approve</button>
                <button className="button ghost" onClick={() => update(l._id, 'Rejected')}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}