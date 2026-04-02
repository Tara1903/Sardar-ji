import { getStatusIndex } from '../../utils/format';

const STATUSES = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

export const OrderTimeline = ({ currentStatus, timeline = [] }) => {
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="timeline">
      {STATUSES.map((status, index) => {
        const entry = timeline.find((item) => item.status === status);
        const isDone = index <= currentIndex;
        return (
          <div className={`timeline-step ${isDone ? 'done' : ''}`} key={status}>
            <div className="timeline-dot" />
            <div>
              <strong>{status}</strong>
              <p>{entry?.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-IN') : 'Pending'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
