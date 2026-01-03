const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { authenticate, authorize } = require('../middleware/auth')

// Admin: list users
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password')
  res.json(users)
})

// Get current user's profile
router.get('/me', authenticate, async (req, res) => {
  const u = await User.findById(req.user._id).select('-password')
  res.json(u)
})

// Update current user's profile (limited fields)
async function handleMeUpdate(req, res) {
  const allowed = ['phone', 'address', 'avatar']
  const updates = {}
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password')
  res.json(user)
}
router.patch('/me', authenticate, handleMeUpdate)
router.put('/me', authenticate, handleMeUpdate)

// Add a document to current user
router.post('/me/documents', authenticate, async (req, res) => {
  const { name, url } = req.body
  const doc = { name, url, uploadedAt: new Date() }
  const user = await User.findByIdAndUpdate(req.user._id, { $push: { documents: doc } }, { new: true }).select('-password')
  res.json(user)
})

// Remove document by index or URL
router.delete('/me/documents/:index', authenticate, async (req, res) => {
  const idx = Number(req.params.index)
  const u = await User.findById(req.user._id)
  if (!u) return res.status(404).json({ message: 'Not found' })
  if (isNaN(idx) || idx < 0 || idx >= (u.documents || []).length) return res.status(400).json({ message: 'Invalid index' })
  u.documents.splice(idx, 1)
  await u.save()
  res.json(u)
})
// Admin: get single user
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  const u = await User.findById(req.params.id).select('-password')
  res.json(u)
})

// Admin: update any user
router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  const disallowed = ['password']
  const updates = { ...req.body }
  disallowed.forEach((k) => delete updates[k])
  const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select('-password')
  res.json(user)
})

module.exports = router
