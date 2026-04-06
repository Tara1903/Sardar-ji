import { motion } from 'framer-motion';
import { getStatusIndex } from '../../utils/format';
import { CONTENT_STACK_VARIANTS, TIMELINE_STEP_VARIANTS } from '../../motion/variants';

const STATUSES = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

export const OrderTimeline = ({ currentStatus, timeline = [] }) => {
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <motion.div animate="show" className="timeline" initial="hidden" variants={CONTENT_STACK_VARIANTS}>
      {STATUSES.map((status, index) => {
        const entry = timeline.find((item) => item.status === status);
        const isDone = index <= currentIndex;
        return (
          <motion.div
            className={`timeline-step ${isDone ? 'done' : ''}`}
            custom={index}
            key={status}
            variants={TIMELINE_STEP_VARIANTS}
          >
            <div className="timeline-dot" />
            <div>
              <strong>{status}</strong>
              <p>{entry?.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-IN') : 'Pending'}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
