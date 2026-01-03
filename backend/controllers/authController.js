const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendVerificationEmail } = require('../utils/email')

function signToken(user, opts = {}) {
  const payload = { id: user._id, role: user.role }
  if (opts.type) payload.type = opts.type
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: opts.expiresIn || '8h' })
}

function validatePassword(password) {
  // At least 8 chars, one uppercase, one lowercase, one number, one special
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*\(\)_\+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
  return re.test(password)
}

exports.register = async (req, res) => {
  const { employeeId, name, email, password, role } = req.body
  try {
    if (!employeeId) return res.status(400).json({ message: 'Employee ID is required' })
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password does not meet complexity requirements' })
    const existsEmail = await User.findOne({ email })
    if (existsEmail) return res.status(400).json({ message: 'Email already used' })
    const existsEmp = await User.findOne({ employeeId })
    if (existsEmp) return res.status(400).json({ message: 'Employee ID already used' })
    const user = await User.create({ employeeId, name, email, password, role })
    // create verification token
    const vtoken = signToken(user, { type: 'verify', expiresIn: '1d' })
    await sendVerificationEmail(user, vtoken)
    // Dev helpers: optionally return token or auto-verify for easier testing
    if (process.env.AUTO_VERIFY === 'true') {
      user.isVerified = true
      await user.save()
      const token = signToken(user)
      return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token })
    }

    const resp = { message: 'Verification email sent. Please check your inbox.' }
    if (process.env.DEV_RETURN_VERIFICATION_TOKEN === 'true') resp.token = vtoken
    return res.json(resp)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.verify = async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ message: 'Missing token' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.type !== 'verify') return res.status(400).json({ message: 'Invalid token' })
    const user = await User.findById(payload.id)
    if (!user) return res.status(400).json({ message: 'User not found' })
    user.isVerified = true
    await user.save()
    res.json({ message: 'Email verified. You can now login.' })
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
    if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' })
    const token = signToken(user)
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.me = (req, res) => {
  const u = req.user
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role })
}
