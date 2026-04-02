const { asyncHandler } = require('../middleware/asyncHandler');
const referralService = require('../services/referralService');
const { referralApplySchema } = require('../utils/validators');

module.exports = {
  applyReferral: asyncHandler(async (req, res) => {
    const { referralCode } = referralApplySchema.parse(req.body);
    const progress = await referralService.applyReferral(req.user.id, referralCode);
    res.json(progress);
  }),

  getReferralProgress: asyncHandler(async (req, res) => {
    const progress = await referralService.getReferralProgress(req.user.id);
    res.json(progress);
  }),
};
