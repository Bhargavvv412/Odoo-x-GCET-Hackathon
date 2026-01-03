const API = import.meta.env.VITE_API_URL || null

// Fallback dummy data
const users = [
  { id: 1, name: 'Alice Admin', email: 'admin@dayflow.com', password: 'adminpass', role: 'admin', isVerified: true },
  { id: 2, name: 'Eve Employee', email: 'eve@dayflow.com', password: 'evepass', role: 'employee', isVerified: true }
]

// simple token store for email verification
const verificationTokens = new Map()

let attendanceData = [
  { id: 1, userId: 2, date: '2026-01-01', status: 'Present', hours: 8 },
  { id: 2, userId: 2, date: '2026-01-02', status: 'Absent', hours: 0 }
]

let leaveRequests = [
  { id: 1, userId: 2, from: '2026-01-10', to: '2026-01-12', reason: 'Vacation', status: 'Approved' }
]

let payrollRecords = [
  { id: 1, userId: 2, month: 'December 2025', base: 4000, allowances: 0, deductions: 200, net: 3800, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: 1 }
]

function normalizePayroll(p) {
  const userObj = users.find(u => u.id === p.userId)
  return {
    _id: String(p.id),
    user: userObj ? { _id: String(userObj.id), name: userObj.name, email: userObj.email } : undefined,
    month: p.month,
    base: p.base ?? p.salary ?? 0,
    allowances: p.allowances ?? 0,
    deductions: p.deductions ?? 0,
    net: p.net ?? ((p.base ?? p.salary ?? 0) + (p.allowances ?? 0) - (p.deductions ?? 0)),
    createdAt: p.createdAt ?? new Date().toISOString()
  }
}

export async function authFetch(path, opts = {}) {
  if (!API) throw new Error('No API configured')
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(API + path, { ...opts, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

export async function mockLogin(email, password) {
  if (API) {
    const res = await authFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    if (res.token) localStorage.setItem('token', res.token)
    return res.user || res
  }
  const u = users.find((x) => x.email === email && x.password === password)
  if (!u) throw new Error('Invalid credentials')
  if (!u.isVerified) throw new Error('Email not verified')
  return { id: u.id, name: u.name, email: u.email, role: u.role }
}

export async function mockRegister({ employeeId, name, email, password, role }) {
  if (API) {
    const res = await authFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ employeeId, name, email, password, role }) })
    // backend returns a message (verification sent) — return the response directly
    return res
  }
  const exists = users.find((x) => x.email === email)
  if (exists) throw new Error('Email already used')
  const id = users.length + 1
  const newUser = { id, name, email, password, role: role || 'employee', isVerified: false }
  users.push(newUser)
  // create a verification token for demo
  const token = `mocktoken-${id}-${Date.now()}`
  verificationTokens.set(token, id)
  return { message: 'Verification email sent. For development, use the token to verify.', token }
}

export async function fetchAttendance(userId) {
  if (API) return authFetch('/api/attendance/me')
  return attendanceData.filter((a) => a.userId === userId)
}

export async function fetchWeeklyAttendance(userId) {
  if (API) return authFetch('/api/attendance/week')
  const today = new Date()
  const day = today.getDay()
  const diff = (day + 6) % 7
  const start = new Date(today)
  start.setDate(today.getDate() - diff)
  start.setHours(0,0,0,0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23,59,59,999)
  return attendanceData.filter((a) => a.userId === userId && new Date(a.date) >= start && new Date(a.date) <= end)
}

export async function fetchAllAttendance() {
  if (API) return authFetch('/api/attendance')
  return attendanceData
}

export async function markAttendance(data) {
  if (API) return authFetch('/api/attendance/mark', { method: 'POST', body: JSON.stringify(data) })
  // demo fallback: upsert by date+userId
  const idx = attendanceData.findIndex(a => a.userId === data.userId && a.date === data.date)
  const existing = idx === -1 ? null : attendanceData[idx]
  const rec = { id: idx === -1 ? attendanceData.length + 1 : existing.id, userId: data.userId, date: data.date, status: data.status || (existing && existing.status) || 'Present', hours: data.hours ?? (existing && existing.hours) ?? 0, note: data.note || (existing && existing.note) || '' }

  // handle checkIn/checkOut
  if (data.checkIn) rec.checkIn = data.checkIn
  if (data.checkOut) rec.checkOut = data.checkOut
  if (rec.checkIn && rec.checkOut) {
    const ms = new Date(rec.checkOut) - new Date(rec.checkIn)
    rec.hours = Math.max(0, Math.round((ms / (1000 * 60 * 60)) * 100) / 100)
    rec.status = rec.hours >= 4 ? 'Present' : 'Half-day'
  }

  // handle Half-day explicit
  if (data.status === 'Half-day' && !data.hours) rec.hours = 4

  if (idx === -1) attendanceData.push(rec)
  else attendanceData[idx] = { ...existing, ...rec }
  return attendanceData.find(a => a.id === rec.id)
}

export async function fetchLeaves(userId) {
  if (API) return authFetch('/api/leave/me')
  if (userId) return leaveRequests.filter((l) => l.userId === userId)
  return leaveRequests
}

export async function fetchAllLeaves() {
  if (API) return authFetch('/api/leave')
  return leaveRequests
}

export async function updateLeaveStatus(id, status, comment) {
  if (API) return authFetch(`/api/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, comment }) })
  const idx = leaveRequests.findIndex((l) => l.id === id)
  if (idx === -1) throw new Error('Not found')
  leaveRequests[idx].status = status
  if (comment) leaveRequests[idx].comment = comment

  // on approval, reflect in attendance mock
  if (status === 'Approved') {
    const rec = leaveRequests[idx]
    const start = new Date(rec.from)
    const end = new Date(rec.to)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateIso = d.toISOString().slice(0,10)
      const ai = attendanceData.findIndex(a => a.userId === rec.userId && a.date === dateIso)
      const arec = { id: ai === -1 ? attendanceData.length + 1 : attendanceData[ai].id, userId: rec.userId, date: dateIso, status: 'Leave', hours: 0, note: comment || 'Approved leave' }
      if (ai === -1) attendanceData.push(arec)
      else attendanceData[ai] = arec
    }
  }

  return leaveRequests[idx]
}

export async function fetchPayroll(userId) {
  if (API) return authFetch('/api/payroll/me')
  if (userId) return payrollRecords.filter((p) => p.userId === userId)
  return payrollRecords
}

export async function fetchAllPayroll() {
  if (API) return authFetch('/api/payroll')
  return payrollRecords.map(normalizePayroll)
}

export async function createPayroll(data) {
  if (API) return authFetch('/api/payroll', { method: 'POST', body: JSON.stringify(data) })
  const id = payrollRecords.length + 1
  const now = new Date().toISOString()
  const rec = { id, ...data, net: (data.base || 0) + (data.allowances || 0) - (data.deductions || 0), createdAt: now, updatedAt: now, updatedBy: 1 }
  payrollRecords.push(rec)
  return normalizePayroll(rec)
}

export async function updatePayroll(id, data) {
  if (API) return authFetch(`/api/payroll/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  const idx = payrollRecords.findIndex(p => String(p.id) === String(id))
  if (idx === -1) throw new Error('Not found')
  const now = new Date().toISOString()
  payrollRecords[idx] = { ...payrollRecords[idx], ...data, net: (data.base ?? payrollRecords[idx].base) + (data.allowances ?? payrollRecords[idx].allowances) - (data.deductions ?? payrollRecords[idx].deductions), updatedAt: now, updatedBy: 1 }
  return normalizePayroll(payrollRecords[idx])
}

export async function submitLeaveRequest(data) {
  if (API) return authFetch('/api/leave', { method: 'POST', body: JSON.stringify(data) })
  const id = leaveRequests.length + 1
  const req = { id, ...data, status: 'Pending' }
  leaveRequests.push(req)
  return req
}

export async function getMe() {
  if (API) return authFetch('/api/auth/me')
  // return first user for demo purposes
  const u = users[0]
  return { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, address: u.address, avatar: u.avatar, jobTitle: u.jobTitle, salaryStructure: u.salaryStructure, documents: u.documents }
}

export async function verifyEmail(token) {
  if (API) return authFetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
  const uid = verificationTokens.get(token)
  if (!uid) throw new Error('Invalid token')
  const u = users.find(x => x.id === uid)
  if (!u) throw new Error('User not found')
  u.isVerified = true
  verificationTokens.delete(token)
  return { message: 'Email verified' }
}

export async function resendVerification(email) {
  if (API) return authFetch('/api/auth/resend', { method: 'POST', body: JSON.stringify({ email }) })
  const u = users.find(x => x.email === email)
  if (!u) throw new Error('User not found')
  if (u.isVerified) return { message: 'Already verified' }
  const token = `mocktoken-${u.id}-${Date.now()}`
  verificationTokens.set(token, u.id)
  return { message: 'Verification sent', token }
}

export async function updateProfile(data) {
  if (API) return authFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) })
  // mock behavior: update local users array if email matches local tokenless user
  const u = users.find((x) => x.email === (data.email || ''))
  if (u) {
    Object.assign(u, data)
    return u
  }
  return { ...data }
}

export async function addDocumentToMe(doc) {
  if (API) return authFetch('/api/users/me/documents', { method: 'POST', body: JSON.stringify(doc) })
  // mock: push to first user for demo
  const u = users[0]
  u.documents = u.documents || []
  u.documents.push({ ...doc, uploadedAt: new Date().toISOString() })
  return u
}

export async function removeDocumentFromMe(index) {
  if (API) return authFetch(`/api/users/me/documents/${index}`, { method: 'DELETE' })
  const u = users[0]
  if (!u) throw new Error('Not found')
  u.documents = u.documents || []
  if (index < 0 || index >= u.documents.length) throw new Error('Invalid index')
  u.documents.splice(index, 1)
  return u
}
