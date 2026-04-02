const { asyncHandler } = require('../middleware/asyncHandler');
const { saveImage } = require('../services/uploadService');

module.exports = {
  uploadImage: asyncHandler(async (req, res) => {
    const result = await saveImage(req.file);
    res.status(201).json(result);
  }),
};
