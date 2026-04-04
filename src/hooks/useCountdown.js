import { useEffect, useState } from 'react';

const getRemainingSeconds = (target = '') => {
  const timestamp = new Date(target || '').getTime();

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
};

export const useCountdown = (target = '') => {
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(target));

  useEffect(() => {
    const nextValue = getRemainingSeconds(target);
    setRemainingSeconds(nextValue);

    if (!target || nextValue <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const updated = getRemainingSeconds(target);
      setRemainingSeconds(updated);

      if (updated <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [target]);

  return remainingSeconds;
};
