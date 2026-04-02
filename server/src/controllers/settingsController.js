const { asyncHandler } = require('../middleware/asyncHandler');
const settingsService = require('../services/settingsService');
const { settingsSchema } = require('../utils/validators');

module.exports = {
  getSettings: asyncHandler(async (_req, res) => {
    const settings = await settingsService.getSettings();
    res.json(settings);
  }),

  updateSettings: asyncHandler(async (req, res) => {
    const payload = settingsSchema.parse(req.body);
    const settings = await settingsService.updateSettings(payload);
    res.json(settings);
  }),
};
