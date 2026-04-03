export const DEFAULT_PHONE_DIGITS = '9779195979';
export const DEFAULT_WHATSAPP_NUMBER = `91${DEFAULT_PHONE_DIGITS}`;
export const DEFAULT_PHONE_NUMBER = '+91 97791 95979';

const DEMO_NUMBERS = new Set([
  '9999999999',
  '919999999999',
  '999999999999',
]);

const digitsOnly = (value = '') => `${value}`.replace(/\D/g, '');

const formatIndianNumber = (digits) => {
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return '';
};

export const normalizeWhatsappNumber = (value) => {
  const digits = digitsOnly(value);

  if (!digits || DEMO_NUMBERS.has(digits)) {
    return DEFAULT_WHATSAPP_NUMBER;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

export const normalizePhoneDisplay = (value) => {
  const digits = digitsOnly(value);

  if (!digits || DEMO_NUMBERS.has(digits)) {
    return DEFAULT_PHONE_NUMBER;
  }

  return formatIndianNumber(digits) || value || DEFAULT_PHONE_NUMBER;
};

export const normalizePhoneInput = (value) => digitsOnly(value).slice(-10);
