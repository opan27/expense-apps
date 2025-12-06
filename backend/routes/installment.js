const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwtAuth');
const installmentController = require('../controllers/installmentController');

router.use(authMiddleware);

router.get('/:id/payments', authMiddleware, installmentController.getPayments);
router.get('/upcoming', installmentController.getUpcomingDue);
router.get('/', installmentController.getAll);
router.post('/', installmentController.create);
router.get('/:id', installmentController.getById);
router.put('/:id', installmentController.update);
router.delete('/:id', installmentController.remove);

module.exports = router;
