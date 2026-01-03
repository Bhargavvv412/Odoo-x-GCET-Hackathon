require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

// Improve diagnostics in dev: log uncaught errors and rejections
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err)
})
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err)
})

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const attendanceRoutes = require('./routes/attendance')
const leaveRoutes = require('./routes/leave')
const payrollRoutes = require('./routes/payroll')

const PORT = process.env.PORT || 4000
const app = express()

const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(s => s.trim())
console.log('Allowed CORS origins:', allowedOrigins)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true)
    // allow common local dev ports (e.g., 5173/5174/5175)
    try {
      const u = new URL(origin)
      if (u.hostname === 'localhost' && u.port && u.port.startsWith('517')) return callback(null, true)
    } catch (e) {
      // ignore parse errors
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Friendly error response for CORS rejections
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: err.message })
  }
  next(err)
})
// Log requests in dev to help debug routing issues
app.use((req, res, next) => {
  console.log('REQ', req.method, req.originalUrl)
  next()
})
app.use(express.json())

app.get('/', (req, res) => res.send('Dayflow backend is up'))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/leave', leaveRoutes)
app.use('/api/payroll', payrollRoutes)

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const srv = app.listen(PORT, () => {
      const addr = srv.address()
      console.log(`Server started on port ${PORT}`)
      console.log('Server address:', addr)
      console.log('Process PID:', process.pid)
    })
    srv.on('error', (err) => {
      console.error('Server error', err)
    })
  })
  .catch((err) => {
    console.error('Mongo connection error', err)
    // don't exit immediately in dev — keep process alive so we can inspect
    if (process.env.NODE_ENV === 'production') process.exit(1)
  })

process.on('exit', (code) => {
  console.log('Process exiting with code', code)
})
process.on('SIGINT', () => {
  console.log('SIGINT received — exiting')
  process.exit(0)
})
