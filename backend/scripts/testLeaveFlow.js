const fetch = require('node-fetch')

const API = 'http://localhost:4000'

async function run() {
  try {
    // Register employee
    await fetch(API + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: 'LV100', name: 'Leave Employee', email: 'leave.employee@example.com', password: 'Aa!123456', role: 'employee' }) })
    // Get token from console or register response if dev token enabled
    const reg = await fetch(API + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: 'LV101', name: 'Leave Employee 2', email: 'leave.employee2@example.com', password: 'Aa!123456', role: 'employee' }) })
    const rj = await reg.json()
    let token = rj.token
    if (!token) {
      console.log('No token returned or email used — attempting to login existing user')
      const loginExisting = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'leave.employee2@example.com', password: 'Aa!123456' }) })
      const lj = await loginExisting.json()
      if (!lj.token) { console.log('Unable to obtain token for employee:', lj); return }
      token = lj.token
    }
    // login (to get token and user)
    const login = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'leave.employee2@example.com', password: 'Aa!123456' }) })
    const lj = await login.json()
    const t = lj.token || token
    // apply leave
    const apply = await fetch(API + '/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ from: '2026-01-10', to: '2026-01-12', reason: 'Vacation' }) })
    console.log('Apply status', apply.status, await apply.json())
    // Admin approve
    // login as admin
    const adminLogin = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@dayflow.com', password: 'adminpass' }) })
    const adminJson = await adminLogin.json()
    console.log('Admin login response', adminJson)
    const at = adminJson.token
    if (!at) { console.log('Admin login failed — aborting'); return }
    // get all leaves
    const all = await fetch(API + '/api/leave', { headers: { Authorization: 'Bearer ' + at } })
    const aj = await all.json()
    console.log('All leaves before', aj)
    const id = aj.find(l => l.reason === 'Vacation')._id
    const upd = await fetch(API + `/api/leave/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + at }, body: JSON.stringify({ status: 'Approved' }) })
    console.log('Approve status', upd.status, await upd.json())
    const after = await fetch(API + '/api/leave', { headers: { Authorization: 'Bearer ' + at } })
    console.log('All leaves after', await after.json())
  } catch (err) { console.error(err) }
}

run()