const fetch = require('node-fetch')

const API = 'http://localhost:4000'

async function run() {
  try {
    // register a new user (use DEV_RETURN_VERIFICATION_TOKEN)
    const reg = await fetch(API + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: 'PRF100', name: 'Profile Test', email: 'profile.test@example.com', password: 'Aa!123456', role: 'employee' }) })
    const regJ = await reg.json()
    console.log('Registered', regJ)
    let tokenToUse = regJ.token
    if (!regJ.token) {
      console.log('Email already used or no token returned — attempting to login existing user')
      const loginExisting = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'profile.test@example.com', password: 'Aa!123456' }) })
      const lj = await loginExisting.json()
      if (lj.token) tokenToUse = lj.token
      else {
        console.log('Cannot obtain token:', lj)
        return
      }
    } else {
      await fetch(API + '/api/auth/verify?token=' + regJ.token)
    }
    // login
    const loginRes = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'profile.test@example.com', password: 'Aa!123456' }) })
    const loginJson = await loginRes.json()
    console.log('Login', loginJson)
    const token = loginJson.token || tokenToUse
    // update profile
    const upd = await fetch(API + '/api/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ phone: '+1234567890', address: '123 Test St', avatar: 'https://example.com/avatar.png' }) })
    const updText = await upd.text()
    console.log('Update status', upd.status, updText)
    // get me
    const me = await fetch(API + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
    const meText = await me.text()
    console.log('Me after update', me.status, meText)
  } catch (err) {
    console.error('Error', err)
  }
}

run()