const Leave = require('../models/Leave')

exports.getForUser = async (req, res) => {
  const items = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(items)
}

exports.getAll = async (req, res) => {
  const items = await Leave.find().populate('user', 'name email').sort({ createdAt: -1 })
  res.json(items)
}

exports.apply = async (req, res) => {
  const data = { user: req.user._id, from: req.body.from, to: req.body.to, reason: req.body.reason, type: req.body.type, comment: req.body.comment }
  const doc = await Leave.create(data)
  res.json(doc)
}

exports.updateStatus = async (req, res) => {
  const { id } = req.params
  const { status, comment } = req.body
  const updates = { status, updatedAt: new Date() }
  if (comment) updates.comment = comment
  const doc = await Leave.findByIdAndUpdate(id, updates, { new: true })

  // If approved, reflect in attendance records for the date range
  if (status === 'Approved') {
    try {
      const leave = doc
      const Attendance = require('../models/Attendance')
      const start = new Date(leave.from)
      const end = new Date(leave.to)
      // iterate days and upsert attendance as 'Leave'
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateOnly = new Date(d)
        dateOnly.setHours(0,0,0,0)
        await Attendance.findOneAndUpdate(
          { user: leave.user, date: dateOnly },
          { status: 'Leave', hours: 0, note: comment || 'Approved leave', date: dateOnly },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      }
    } catch (err) {
      // don't block update if attendance marking fails — log server-side
      console.error('Error reflecting leave in attendance:', err.message)
    }
  }

  res.json(doc)
}
