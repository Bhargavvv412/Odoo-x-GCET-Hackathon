import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { authFetch, fetchAllPayroll, createPayroll, updatePayroll } from '../services/mockApi'

export default function AdminPayroll() {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    // load payrolls
    (async () => {
      try {
        const list = await fetchAllPayroll()
        setPayrolls(list)
      } catch (e) {
        setError(e.message)
      }
    })()

    // load users
    ;(async () => {
      try {
        const res = await authFetch('/api/users')
        setUsers(res)
      } catch (e) {
        // ignore if not available
      }
    })()
  }, [user])

  async function createPayroll(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const form = e.target
    const data = {
      userId: form.userId.value,
      month: form.month.value.trim(),
      base: Number(form.base.value || 0),
      allowances: Number(form.allowances.value || 0),
      deductions: Number(form.deductions.value || 0)
    }
    if (!data.userId || !data.month) { setError('User and month are required'); return }
    setLoading(true)
    try {
      const res = await createPayroll(data)
      setPayrolls((p) => [res, ...p])
      setCreating(false)
      setSuccess('Payroll created')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  async function saveEdit(id) {
    setError(null)
    setSuccess(null)
    const base = Number(document.getElementById('edit-base').value || 0)
    const allowances = Number(document.getElementById('edit-allowances').value || 0)
    const deductions = Number(document.getElementById('edit-deductions').value || 0)
    setLoading(true)
    try {
      const res = await updatePayroll(id, { base, allowances, deductions })
      setPayrolls((p) => p.map(x => x._id === id ? res : x))
      setEditing(null)
      setSuccess('Payroll updated')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2>Payroll Management</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {loading && <div className="info">Processing...</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><strong>Total:</strong> {payrolls.length}</div>
          <div>
            <button onClick={() => setCreating((c) => !c)}>{creating ? 'Close' : 'Create Payroll'}</button>
          </div>
        </div>

        {creating && (
          <form onSubmit={createPayroll} style={{ marginTop: 12 }}>
            <label>User</label>
            <select name="userId" required>
              <option value="">Select user</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <label>Month</label>
            <input name="month" placeholder="e.g., December 2025" required />
            <label>Base</label>
            <input name="base" type="number" step="0.01" defaultValue={0} />
            <label>Allowances</label>
            <input name="allowances" type="number" step="0.01" defaultValue={0} />
            <label>Deductions</label>
            <input name="deductions" type="number" step="0.01" defaultValue={0} />
            <div style={{ marginTop: 8 }}>
              <button type="submit">Create</button>
              <button type="button" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </form>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Employee</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Month</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Base</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Allowances</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Deductions</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Net</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Last updated</th>
              <th style={{ textAlign: 'left', padding: '8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(p => (
              <tr key={p._id}>
                <td style={{ padding: '8px' }}>{(p.user && p.user.name) || p.userId}</td>
                <td style={{ padding: '8px' }}>{p.month}</td>
                <td style={{ padding: '8px' }}>{p.base}</td>
                <td style={{ padding: '8px' }}>{p.allowances}</td>
                <td style={{ padding: '8px' }}>{p.deductions}</td>
                <td style={{ padding: '8px' }}>${p.net}</td>
                <td style={{ padding: '8px' }}>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-'}</td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => setEditing(p)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Edit Payroll for {(editing.user && editing.user.name) || editing.userId}</h3>
          <label>Base</label>
          <input id="edit-base" defaultValue={editing.base || 0} type="number" />
          <label>Allowances</label>
          <input id="edit-allowances" defaultValue={editing.allowances || 0} type="number" />
          <label>Deductions</label>
          <input id="edit-deductions" defaultValue={editing.deductions || 0} type="number" />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => saveEdit(editing._id)}>Save</button>
            <button onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
