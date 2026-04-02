const { login, register, sanitizeUser } = require('../services/authService');
const { dataStore } = require('../services/dataStore');
const { asyncHandler } = require('../middleware/asyncHandler');
const { addressSchema, loginSchema, registerSchema } = require('../utils/validators');

module.exports = {
  listUsers: asyncHandler(async (req, res) => {
    const users = await dataStore.getUsersByRole(req.query.role);
    res.json(users.map((user) => sanitizeUser(user)));
  }),

  login: asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await login(payload);
    res.json(result);
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
  }),

  register: asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const result = await register(payload);
    res.status(201).json(result);
  }),

  updateAddresses: asyncHandler(async (req, res) => {
    const addresses = req.body.addresses.map((address) => addressSchema.parse(address));
    const updatedUser = await dataStore.updateUser(req.user.id, { addresses });
    res.json({ user: sanitizeUser(updatedUser) });
  }),
};
