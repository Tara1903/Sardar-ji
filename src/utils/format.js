export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDateTime = (value) =>
  Number.isNaN(new Date(value).getTime())
    ? 'Updating'
    : new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(value));

export const formatDateOnly = (value) =>
  Number.isNaN(new Date(value).getTime())
    ? 'Updating'
    : new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));

export const formatEtaLabel = (value) => {
  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return 'ETA updating';
  }

  const diffInMinutes = Math.max(0, Math.round((target.getTime() - Date.now()) / 60000));

  if (diffInMinutes <= 1) {
    return 'Arriving soon';
  }

  return `${diffInMinutes} min`;
};

export const getStatusIndex = (status) =>
  ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(status);

export const initials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
