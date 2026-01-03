const fetch = require('node-fetch')

const API = 'http://localhost:4000'

async function run() {
  try {
    console.log('Registering test user...')
    const regRes = await fetch(API + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'AUTO100', name: 'Auto Test', email: 'auto.test+1@example.com', password: 'Aa!123456', role: 'employee' })
    })
    const regJson = await regRes.json()
    console.log('Register status', regRes.status, regJson)

    // extract token if present (dev helper)
    const vtoken = regJson.token
    if (!vtoken) console.log('No token returned; please check backend console for mock email link or enable DEV_RETURN_VERIFICATION_TOKEN=true')

    if (vtoken) {
      console.log('Verifying token...')
      const verRes = await fetch(API + '/api/auth/verify?token=' + vtoken)
      console.log('Verify status', verRes.status, await verRes.json())
    }

    console.log('Attempting login (should fail if not verified)...')
    const loginRes = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'auto.test+1@example.com', password: 'Aa!123456' })
    })
    const loginJson = await loginRes.json()
    console.log('Login status', loginRes.status, loginJson)

    if (loginJson.token) {
      console.log('Login succeeded — calling /api/auth/me')
      const meRes = await fetch(API + '/api/auth/me', { headers: { Authorization: 'Bearer ' + loginJson.token } })
      console.log('Me:', meRes.status, await meRes.json())
    }

  } catch (err) {
    console.error('Error', err)
  }
}

run()
