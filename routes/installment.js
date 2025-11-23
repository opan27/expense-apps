const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/jwtAuth');
const installmentController = require('../controllers/installmentController');

router.use(authMiddleware); // semua endpoint butuh JWT

router.get('/', installmentController.getAll);        // GET /api/installments
router.post('/', installmentController.create);       // POST /api/installments
router.get('/:id', installmentController.getById);    // GET /api/installments/:id
router.put('/:id', installmentController.update);     // PUT /api/installments/:id
router.delete('/:id', installmentController.remove);  // DELETE /api/installments/:id

module.exports = router;
