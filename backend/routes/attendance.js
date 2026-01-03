const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/attendanceController')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/', authenticate, authorize('admin'), ctrl.getAll)
router.get('/me', authenticate, ctrl.getForUser)
router.get('/week', authenticate, ctrl.getWeek)
router.post('/mark', authenticate, ctrl.mark)

module.exports = router
