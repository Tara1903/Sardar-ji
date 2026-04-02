const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { dataStore } = require('../services/dataStore');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await dataStore.getUserById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have access to this resource.' });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
};
