const { randomUUID } = require('crypto');

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createId = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;

const createReferralCode = (name) => {
  const base = slugify(name).replace(/-/g, '').slice(0, 6).toUpperCase() || 'SARDAR';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
};

const nowIso = () => new Date().toISOString();

const createOrderNumber = () => `SJ${Date.now().toString().slice(-8)}`;

const getEta = (minutes = 35) => {
  const eta = new Date(Date.now() + minutes * 60 * 1000);
  return eta.toISOString();
};

module.exports = {
  createId,
  createOrderNumber,
  createReferralCode,
  getEta,
  nowIso,
  slugify,
};
