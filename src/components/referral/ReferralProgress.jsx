export const ReferralProgress = ({ progress }) => {
  if (!progress) {
    return null;
  }

  return (
    <section className="panel-card referral-card">
      <div className="space-between">
        <div>
          <p className="eyebrow">Referral rewards</p>
          <h3>Your referral code</h3>
        </div>
        <strong className="referral-code">{progress.referralCode}</strong>
      </div>

      <p>{progress.successfulReferralCount} successful joins so far.</p>

      <div className="milestone-list">
        {progress.milestones.map((milestone) => (
          <div className={`milestone ${milestone.unlocked ? 'unlocked' : ''}`} key={milestone.target}>
            <strong>{milestone.target} referrals</strong>
            <span>{milestone.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
