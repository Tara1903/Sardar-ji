const express = require('express');
const controller = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.getSettings);
router.put('/', authenticate, authorize('admin'), controller.updateSettings);

module.exports = router;
