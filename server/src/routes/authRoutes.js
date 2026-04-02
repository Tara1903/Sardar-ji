const express = require('express');
const controller = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authenticate, controller.me);
router.put('/addresses', authenticate, controller.updateAddresses);
router.get('/users', authenticate, authorize('admin'), controller.listUsers);

module.exports = router;
