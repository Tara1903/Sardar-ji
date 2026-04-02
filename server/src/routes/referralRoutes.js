const express = require('express');
const controller = require('../controllers/referralController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, authorize('customer'), controller.getReferralProgress);
router.post('/apply', authenticate, authorize('customer'), controller.applyReferral);

module.exports = router;
