const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Half-day'], required: true },
  hours: { type: Number, default: 0 },
  checkIn: { type: Date },
  checkOut: { type: Date },
  note: { type: String }
}, { timestamps: true })

attendanceSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Attendance', attendanceSchema)
