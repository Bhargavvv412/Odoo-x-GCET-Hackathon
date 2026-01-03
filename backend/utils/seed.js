require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  await User.deleteMany({})
  await User.create({ employeeId: 'EMP-0001', name: 'Alice Admin', email: 'admin@dayflow.com', password: 'adminpass', role: 'admin', isVerified: true })
  await User.create({ employeeId: 'EMP-0002', name: 'Eve Employee', email: 'eve@dayflow.com', password: 'evepass', role: 'employee', isVerified: true })
  console.log('Seeded users')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
