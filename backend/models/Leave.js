const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  type: { type: String, enum: ['Paid', 'Sick', 'Unpaid'], default: 'Paid' },
  reason: { type: String },
  comment: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Leave', leaveSchema)
