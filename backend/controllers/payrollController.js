const Payroll = require('../models/Payroll')

exports.getForUser = async (req, res) => {
  const userId = req.user._id
  const items = await Payroll.find({ user: userId }).sort({ createdAt: -1 })
  res.json(items)
}

exports.getAll = async (req, res) => {
  const items = await Payroll.find().populate('user', 'name email').populate('updatedBy', 'name email').sort({ createdAt: -1 })
  res.json(items)
}

exports.create = async (req, res) => {
  // Coerce numeric inputs and ensure compatibility with older schema which may expect 'salary'
  const { userId, month } = req.body
  const base = Number(req.body.base) || 0
  const allowances = Number(req.body.allowances) || 0
  const deductions = Number(req.body.deductions) || 0
  if (!userId || !month) return res.status(400).json({ message: 'Missing fields' })
  const net = (base + allowances) - deductions
  // also set salary for backward compatibility
  const doc = await Payroll.create({ user: userId, month, base, allowances, deductions, net, salary: base, updatedBy: req.user._id, updatedAt: new Date() })
  res.json(doc)
}

exports.update = async (req, res) => {
  const { id } = req.params
  const updates = { ...req.body }
  // coerce numeric updates when present and recompute net
  if (updates.base !== undefined || updates.allowances !== undefined || updates.deductions !== undefined) {
    const cur = await Payroll.findById(id)
    const base = (updates.base !== undefined) ? Number(updates.base) || 0 : (cur.base || 0)
    const allowances = (updates.allowances !== undefined) ? Number(updates.allowances) || 0 : (cur.allowances || 0)
    const deductions = (updates.deductions !== undefined) ? Number(updates.deductions) || 0 : (cur.deductions || 0)
    updates.net = (base + allowances) - deductions
    updates.salary = base
    updates.base = base
    updates.allowances = allowances
    updates.deductions = deductions
  }
  updates.updatedAt = new Date()
  updates.updatedBy = req.user._id
  const doc = await Payroll.findByIdAndUpdate(id, { $set: updates }, { new: true })
  res.json(doc)
}

exports.getById = async (id) => {
  return Payroll.findById(id).populate('user', 'name email')
}
