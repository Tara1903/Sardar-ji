import { formatDateOnly } from '../../utils/format';

const shortId = (value = '') => (value ? `${value.slice(0, 8)}...${value.slice(-4)}` : 'Updating');

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
      {progress.appliedReferralCode ? <p>Applied friend code: {progress.appliedReferralCode}</p> : null}

      <div className="milestone-list">
        {progress.milestones.map((milestone) => (
          <div className={`milestone ${milestone.unlocked ? 'unlocked' : ''}`} key={milestone.target}>
            <strong>{milestone.target} referrals</strong>
            <span>{milestone.title}</span>
          </div>
        ))}
      </div>

      {progress.referralEntries?.length ? (
        <div className="referral-entry-list">
          <div className="space-between">
            <h4>Existing referral joins</h4>
            <span>{progress.referralEntries.length} linked</span>
          </div>
          {progress.referralEntries.map((entry) => (
            <div className="referral-entry-row" key={entry.id}>
              <div>
                <strong>{shortId(entry.referredUserId)}</strong>
                <p>Referral ID: {shortId(entry.id)}</p>
              </div>
              <div>
                <strong>{entry.status}</strong>
                <p>{formatDateOnly(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
