const express = require('express');
const controller = require('../controllers/trackingController');

const router = express.Router();

router.get('/:orderId', controller.getTracking);

module.exports = router;
