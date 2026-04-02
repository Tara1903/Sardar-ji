const express = require('express');
const controller = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, controller.getOrders);
router.post('/', authenticate, authorize('customer'), controller.createOrder);
router.put('/:id/status', authenticate, authorize('admin', 'delivery'), controller.updateOrderStatus);

module.exports = router;
