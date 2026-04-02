const express = require('express');
const controller = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.getCategories);
router.post('/', authenticate, authorize('admin'), controller.createCategory);

module.exports = router;
