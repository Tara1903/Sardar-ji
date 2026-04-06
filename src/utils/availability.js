const dayLabels = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const toMinutes = (timeValue = '') => {
  const [hours, minutes] = String(timeValue || '')
    .split(':')
    .map((value) => Number(value || 0));

  return hours * 60 + minutes;
};

export const defaultAvailabilitySchedule = {
  enabled: false,
  days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  startTime: '08:00',
  endTime: '23:00',
};

export const normalizeAvailabilitySchedule = (schedule = {}) => ({
  ...defaultAvailabilitySchedule,
  ...(schedule || {}),
  days:
    Array.isArray(schedule?.days) && schedule.days.length
      ? schedule.days.map((day) => String(day).slice(0, 3).toLowerCase())
      : defaultAvailabilitySchedule.days,
});

export const isScheduleActiveNow = (schedule) => {
  const normalized = normalizeAvailabilitySchedule(schedule);

  if (!normalized.enabled) {
    return true;
  }

  const now = new Date();
  const currentDay = dayLabels[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = toMinutes(normalized.startTime);
  const endMinutes = toMinutes(normalized.endTime);
  const sameDayWindow = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  return normalized.days.includes(currentDay) && sameDayWindow;
};

export const formatAvailabilityWindow = (schedule) => {
  const normalized = normalizeAvailabilitySchedule(schedule);

  if (!normalized.enabled) {
    return 'Available all day';
  }

  return `${normalized.days.join(', ')} • ${normalized.startTime} - ${normalized.endTime}`;
};

export const applyProductAvailabilitySchedule = (product, scheduleMap = {}) => {
  const schedule = normalizeAvailabilitySchedule(scheduleMap?.[product.id] || null);
  const isScheduledAvailable = isScheduleActiveNow(schedule);
  const baseIsAvailable = product.isAvailable !== false;

  return {
    ...product,
    baseIsAvailable,
    availabilitySchedule: schedule,
    isAvailable: baseIsAvailable && isScheduledAvailable,
    scheduleLabel: formatAvailabilityWindow(schedule),
    isScheduledOutOfStock: baseIsAvailable && !isScheduledAvailable,
  };
};
