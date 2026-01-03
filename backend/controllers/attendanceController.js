const Attendance = require('../models/Attendance')

exports.getForUser = async (req, res) => {
  const userId = req.user._id
  const items = await Attendance.find({ user: userId }).sort({ date: -1 })
  res.json(items)
}

exports.getAll = async (req, res) => {
  const items = await Attendance.find().populate('user', 'name email').sort({ date: -1 })
  res.json(items)
}

// Get attendance for current week; admins may pass userId query to filter
exports.getWeek = async (req, res) => {
  try {
    const now = new Date()
    // set to start of week (Monday)
    const day = now.getDay()
    const diff = (day + 6) % 7 // days since Monday
    const start = new Date(now)
    start.setDate(now.getDate() - diff)
    start.setHours(0,0,0,0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23,59,59,999)

    const filter = { date: { $gte: start, $lte: end } }
    if (req.query.userId) filter.user = req.query.userId
    // non-admins only get their own
    if (req.user.role !== 'admin') filter.user = req.user._id

    const items = await Attendance.find(filter).populate('user', 'name email').sort({ date: -1 })
    res.json(items)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.mark = async (req, res) => {
  const { date, status, hours, note, checkIn, checkOut } = req.body
  try {
    const updates = { note }
    if (status) updates.status = status
    if (hours !== undefined) updates.hours = hours
    if (checkIn) updates.checkIn = new Date(checkIn)
    if (checkOut) updates.checkOut = new Date(checkOut)

    // compute hours if both checkIn and checkOut provided
    if (updates.checkIn && updates.checkOut) {
      const ms = updates.checkOut - updates.checkIn
      const h = Math.max(0, Math.round((ms / (1000 * 60 * 60)) * 100) / 100)
      updates.hours = h
      if (!updates.status) updates.status = h >= 4 ? 'Present' : 'Half-day'
    }

    // if status provided and no hours, set default hours for Half-day
    if (updates.status === 'Half-day' && updates.hours === undefined) updates.hours = 4

    // default status to Present if there is a checkIn and no status
    if (!updates.status && updates.checkIn) updates.status = 'Present'

    const doc = await Attendance.findOneAndUpdate(
      { user: req.user._id, date },
      updates,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    res.json(doc)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
} 
