const { dataStore } = require('./dataStore');

const getReferralProgress = async (userId) => {
  const user = await dataStore.getUserById(userId);
  const referralCount = user.successfulReferrals?.length || 0;

  return {
    referralCode: user.referralCode,
    successfulReferralCount: referralCount,
    milestones: [
      {
        target: 6,
        title: '1 Month FREE',
        unlocked: referralCount >= 6,
      },
      {
        target: 12,
        title: '1 Month FREE + Rs 1500 coupon',
        unlocked: referralCount >= 12,
      },
    ],
  };
};

const applyReferral = async (userId, referralCode) => {
  await dataStore.applyReferralCode(userId, referralCode);
  return getReferralProgress(userId);
};

module.exports = {
  applyReferral,
  getReferralProgress,
};
