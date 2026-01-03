const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/leaveController')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/', authenticate, authorize('admin'), ctrl.getAll)
router.get('/me', authenticate, ctrl.getForUser)
router.post('/', authenticate, ctrl.apply)
router.patch('/:id/status', authenticate, authorize('admin'), ctrl.updateStatus)

module.exports = router
