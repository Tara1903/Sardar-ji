const express = require('express');
const multer = require('multer');
const controller = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', authenticate, authorize('admin'), upload.single('image'), controller.uploadImage);

module.exports = router;
