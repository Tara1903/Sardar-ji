import { formatDateOnly } from '../../utils/format';
import { Share2 } from 'lucide-react';
import { shareNativeContent, triggerNativeHaptic } from '../../lib/nativeFeatures';

const shortId = (value = '') => (value ? `${value.slice(0, 8)}...${value.slice(-4)}` : 'Updating');
const getReferralStatusLabel = (entry) => {
  if (entry.status === 'active_plan') {
    return 'Active monthly plan';
  }

  if (entry.status === 'order_rewarded') {
    return entry.rewardValue ? `First order reward issued • ₹${entry.rewardValue}` : 'First order reward issued';
  }

  if (entry.status === 'rewarded') {
    return 'Reward completed';
  }

  return 'Pending qualification';
};

export const ReferralProgress = ({ progress }) => {
  if (!progress) {
    return null;
  }

  const handleShareReferral = async () => {
    const shared = await shareNativeContent({
      title: 'Sardar Ji Food Corner referral',
      text: `Use my referral code ${progress.referralCode} on Sardar Ji Food Corner and unlock rewards after your first subscription or qualifying order.`,
      url: `${window.location.origin}/auth`,
    });

    if (shared) {
      void triggerNativeHaptic('light');
    }
  };

  return (
    <section className="panel-card referral-card">
      <div className="space-between">
        <div>
          <p className="eyebrow">Referral rewards</p>
          <h3>Your referral code</h3>
        </div>
        <div className="referral-share-group">
          <strong className="referral-code">{progress.referralCode}</strong>
          <button className="btn btn-secondary referral-share-button" onClick={handleShareReferral} type="button">
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>

      <p>Active plan referrals: {progress.activePlanReferralCount}</p>
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
            <h4>Referral activity</h4>
            <span>{progress.referralEntries.length} linked</span>
          </div>
          {progress.referralEntries.map((entry) => (
            <div className="referral-entry-row" key={entry.id}>
              <div>
                <strong>{shortId(entry.referredUserId)}</strong>
                <p>Referral ID: {shortId(entry.id)}</p>
              </div>
              <div>
                <strong>{getReferralStatusLabel(entry)}</strong>
                <p>{formatDateOnly(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
