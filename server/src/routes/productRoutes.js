const express = require('express');
const controller = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authenticate, authorize('admin'), controller.createProduct);
router.put('/:id', authenticate, authorize('admin'), controller.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), controller.deleteProduct);

module.exports = router;
