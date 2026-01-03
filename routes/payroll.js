const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/payrollController')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/me', authenticate, ctrl.getForUser)
router.get('/', authenticate, authorize('admin'), ctrl.getAll)
router.post('/', authenticate, authorize('admin'), ctrl.create)
router.patch('/:id', authenticate, authorize('admin'), ctrl.update)
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  const p = await ctrl.getById(req.params.id)
  res.json(p)
})

module.exports = router
