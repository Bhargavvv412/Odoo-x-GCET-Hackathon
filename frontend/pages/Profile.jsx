import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchPayroll, updateProfile, getMe } from '../services/mockApi'

export default function Profile() {
  const { user } = useAuth()
  const [payroll, setPayroll] = useState([])
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatar, setAvatar] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [docs, setDocs] = useState([])
  const [docName, setDocName] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (user) {
      fetchPayroll(user.id).then(setPayroll)
      setPhone(user.phone || '')
      setAddress(user.address || '')
      setAvatar(user.avatar || '')
      setJobTitle(user.jobTitle || '')
      setDocs(user.documents || [])
    }
  }, [user])

  async function save() {
    setMsg(null)
    try {
      const res = await updateProfile({ phone, address, avatar })
      // refresh user in context by reloading 'me'
      const me = await getMe()
      if (me) {
        // set user in auth context: trigger by simple page reload if needed
        window.location.reload()
      }
      setMsg('Profile saved')
      setEditing(false)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div>
      <h2>Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            {avatar ? <img src={avatar} alt="avatar" width={120} style={{ borderRadius: 8 }} /> : <div style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No photo</div>}
          </div>
          <div>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Job title:</strong> {jobTitle || '-'}</p>
            <p><strong>Phone:</strong> {user?.phone || '-'}</p>
            <p><strong>Address:</strong> {user?.address || '-'}</p>
            {!editing && <div style={{ marginTop: 8 }}><button onClick={() => setEditing(true)}>Edit Profile</button></div>}
          </div>
        </div>

        {editing && (
          <div style={{ marginTop: 12 }}>
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
            <label>Avatar URL</label>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            <div style={{ marginTop: 8 }}>
              <button onClick={save} className="button">Save</button>
              <button onClick={() => setEditing(false)} className="button ghost">Cancel</button>
            </div>
            {msg && <div className="info">{msg}</div>}
          </div>
        )}
      </div>

      <h3>Salary</h3>
      <div className="card">
        <p><strong>Base:</strong> ${user?.salaryStructure?.base ?? 0}</p>
        <p><strong>Allowances:</strong> ${user?.salaryStructure?.allowances ?? 0}</p>
        <p><strong>Deductions:</strong> ${user?.salaryStructure?.deductions ?? 0}</p>
      </div>

      <h3>Documents</h3>
      <div className="card">
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Document name" value={docName} onChange={(e) => setDocName(e.target.value)} />
          <input placeholder="Document URL" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button className="button" onClick={async () => {
              if (!docName || !docUrl) return alert('Provide name and url')
              const u = await addDocumentToMe({ name: docName, url: docUrl })
              setDocs(u.documents || [])
              setDocName(''); setDocUrl('')
            }}>Upload</button>
          </div>
        </div>
        <div className="grid">
          {docs.length ? docs.map((d, i) => (
            <div className="card" key={i}>
              <p><strong>{d.name}</strong></p>
              <a href={d.url} target="_blank" rel="noreferrer">Open</a>
              <div style={{ marginTop: 8 }}>
                <button className="button ghost" onClick={async () => {
                  const u = await removeDocumentFromMe(i)
                  setDocs(u.documents || [])
                }}>Remove</button>
              </div>
            </div>
          )) : <p>No documents</p>}
        </div>
      </div>

      <h3>Payroll History</h3>
      <div className="grid">
        {payroll.length ? payroll.map((p) => (
          <div className="card" key={p.id}>
            <p>{p.month}</p>
            <p>Net: ${p.net}</p>
          </div>
        )) : <p>No payroll found</p>}
      </div>
    </div>
  )
}
