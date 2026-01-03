import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { authFetch } from '../services/mockApi'

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    authFetch('/api/users')
      .then(setUsers)
      .catch((e) => setError(e.message))
  }, [user])

  const [editingUser, setEditingUser] = useState(null)

  async function saveUser(id, updates) {
    try {
      const res = await authFetch('/api/users/' + id, { method: 'PATCH', body: JSON.stringify(updates) })
      setUsers((prev) => prev.map((u) => (u._id === id ? res : u)))
      setEditingUser(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>All Registered Users</h2>
      {error && <div className="error">{error}</div>}
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Created</th>
              <th style={{ textAlign: 'left', padding: '8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ padding: '8px' }}>{u.name}</td>
                <td style={{ padding: '8px' }}>{u.email}</td>
                <td style={{ padding: '8px' }}>{u.role}</td>
                <td style={{ padding: '8px' }}>{u.jobTitle || '-'}</td>
                <td style={{ padding: '8px' }}>{new Date(u.createdAt).toLocaleString()}</td>
                <td style={{ padding: '8px' }}><button onClick={() => setEditingUser(u)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p>No users found</p>}
      </div>

      {editingUser && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Edit User: {editingUser.name}</h3>
          <label>Name</label>
          <input defaultValue={editingUser.name} id="edit-name" />
          <label>Role</label>
          <select defaultValue={editingUser.role} id="edit-role">
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <label>Job title</label>
          <input defaultValue={editingUser.jobTitle} id="edit-jobtitle" />
          <label>Base salary</label>
          <input defaultValue={editingUser.salaryStructure?.base || 0} id="edit-base-salary" type="number" />
          <label>Allowances</label>
          <input defaultValue={editingUser.salaryStructure?.allowances || 0} id="edit-allowances-salary" type="number" />
          <label>Deductions</label>
          <input defaultValue={editingUser.salaryStructure?.deductions || 0} id="edit-deductions-salary" type="number" />
          <label>Phone</label>
          <input defaultValue={editingUser.phone} id="edit-phone" />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => saveUser(editingUser._id, {
              name: document.getElementById('edit-name').value,
              role: document.getElementById('edit-role').value,
              jobTitle: document.getElementById('edit-jobtitle').value,
              salaryStructure: {
                base: Number(document.getElementById('edit-base-salary').value || 0),
                allowances: Number(document.getElementById('edit-allowances-salary').value || 0),
                deductions: Number(document.getElementById('edit-deductions-salary').value || 0)
              },
              phone: document.getElementById('edit-phone').value
            })}>Save</button>
            <button onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
