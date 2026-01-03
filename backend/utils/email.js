const jwt = require('jsonwebtoken')

exports.sendVerificationEmail = (user, token) => {
  // Mocked email sender — in prod, integrate with SMTP or email provider
  const link = `${process.env.FRONTEND_URL?.split(',')?.[0] || 'http://localhost:5173'}/verify-email?token=${token}`
  console.log(`Mock email: send verification link to ${user.email}`)
  console.log(`Verification link (mock): ${link}`)
  return Promise.resolve()
}
