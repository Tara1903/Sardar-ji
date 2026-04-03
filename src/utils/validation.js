export const normalizeEmail = (value = '') => value.trim().toLowerCase();

export const getPhoneDigits = (value = '') => `${value}`.replace(/\D/g, '');

export const isValidEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export const isValidPhoneNumber = (value = '') => {
  const digits = getPhoneDigits(value);
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
};

export const isStrongPassword = (value = '') =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

export const generateTemporaryPassword = () =>
  `Sjfc${Math.random().toString(36).slice(2, 6)}${Date.now().toString().slice(-2)}!`;
