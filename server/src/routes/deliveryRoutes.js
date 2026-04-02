const express = require('express');
const controller = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/location-update', authenticate, authorize('delivery'), controller.updateLocation);

module.exports = router;
