const express = require('express')
const router = express.Router()
const auth = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

router.post('/register', auth.register)
router.get('/verify', auth.verify)
router.post('/login', auth.login)
router.get('/me', authenticate, auth.me)

module.exports = router
