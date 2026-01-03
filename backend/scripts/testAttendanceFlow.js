const fetch = require('node-fetch')
const API = 'http://localhost:4000'

async function run() {
  try {
    // register and auto-verify
    await fetch(API + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: 'AT100', name: 'Attend Test', email: 'attend.test@example.com', password: 'Aa!123456', role: 'employee' }) })
    const reg = await fetch(API + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: 'AT101', name: 'Attend Test 2', email: 'attend.test2@example.com', password: 'Aa!123456', role: 'employee' }) })
    const rj = await reg.json()
    let token = rj.token
    if (!token) {
      // try login existing
      const loginExisting = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'attend.test2@example.com', password: 'Aa!123456' }) })
      const lj = await loginExisting.json()
      token = lj.token
    }
    // mark attendance for today
    const mark = await fetch(API + '/api/attendance/mark', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ date: new Date().toISOString().slice(0,10), status: 'Present', hours: 8, note: 'Test check-in' }) })
    console.log('Mark status', mark.status, await mark.json())

    // login admin and fetch all attendance
    const alogin = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@dayflow.com', password: 'adminpass' }) })
    const aj = await alogin.json()
    if (!aj.token) { console.log('Admin login failed', aj); return }
    const all = await fetch(API + '/api/attendance', { headers: { Authorization: 'Bearer ' + aj.token } })
    console.log('All attendance', await all.json())
  } catch (err) {
    console.error('Error', err)
  }
}

run()