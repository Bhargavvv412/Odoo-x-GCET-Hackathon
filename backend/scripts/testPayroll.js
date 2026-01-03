const fetch = require('node-fetch')

const API = 'http://localhost:4000'

async function run() {
  try {
    // ensure a test employee exists
    await fetch(API + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: 'PY100', name: 'Payroll Employee', email: 'pay.employee@example.com', password: 'Aa!123456', role: 'employee' }) })
    // login as employee to obtain token
    let login = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'pay.employee@example.com', password: 'Aa!123456' }) })
    let lj = await login.json()
    let employeeToken = lj.token
    if (!employeeToken) {
      console.log('Employee token not returned; trying to login existing')
      const loginExisting = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'pay.employee@example.com', password: 'Aa!123456' }) })
      const le = await loginExisting.json()
      employeeToken = le.token
    }

    // admin login
    const adminLogin = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@dayflow.com', password: 'adminpass' }) })
    const adminJson = await adminLogin.json()
    const at = adminJson.token
    if (!at) { console.log('Admin login failed — aborting'); return }

    // get users to find our test employee _id
    const usersRes = await fetch(API + '/api/users', { headers: { Authorization: 'Bearer ' + at } })
    const users = await usersRes.json()
    const target = users.find(u => u.email === 'pay.employee@example.com')
    if (!target) { console.log('Test employee not found in users'); return }
    const userId = target._id

    // create payroll as admin
    const create = await fetch(API + '/api/payroll', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + at }, body: JSON.stringify({ userId, month: 'December 2025', base: 4000, allowances: 200, deductions: 100 }) })
    console.log('Create payroll status', create.status, await create.json())

    // admin: list payrolls
    const all = await fetch(API + '/api/payroll', { headers: { Authorization: 'Bearer ' + at } })
    console.log('All payrolls', await all.json())

    // employee: fetch my payrolls
    const me = await fetch(API + '/api/payroll/me', { headers: { Authorization: 'Bearer ' + employeeToken } })
    console.log('Employee payrolls', await me.json())

  } catch (err) { console.error(err) }
}

run()
