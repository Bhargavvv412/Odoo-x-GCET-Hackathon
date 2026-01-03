const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.authenticate = async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'No token' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ message: 'Invalid token' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

exports.authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles]
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' })
    if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
    next()
  }
}
