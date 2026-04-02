const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { assertSupabaseConfigured, supabaseAdmin, supabaseAuth } = require('../config/supabase');
const { dataStore } = require('./dataStore');

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return user;
};

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: '7d',
  });

const waitForUserProfile = async (userId, attempts = 10) => {
  for (let index = 0; index < attempts; index += 1) {
    const user = await dataStore.getUserById(userId);
    if (user) {
      return user;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  }

  throw new Error('User profile not found.');
};

const register = async ({ name, email, password, phoneNumber, referralCode }) => {
  assertSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      phoneNumber,
      role: 'customer',
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to create account.');
  }

  if (!data?.user?.id) {
    throw new Error('Account was created but the user record could not be confirmed.');
  }

  await waitForUserProfile(data.user.id);

  // Auth triggers create the public.users row. A second pass keeps phone/name aligned.
  await dataStore.updateUser(data.user.id, {
    name,
    phoneNumber,
  });

  if (referralCode) {
    try {
      await dataStore.applyReferralCode(data.user.id, referralCode);
    } catch {
      // Registration should still succeed when an optional referral code is invalid.
    }
  }

  const fresh = await waitForUserProfile(data.user.id);

  return {
    token: signToken(fresh),
    user: sanitizeUser(fresh),
  };
};

const login = async ({ email, password }) => {
  assertSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data?.user?.id) {
    throw new Error('Invalid email or password.');
  }

  const user = await waitForUserProfile(data.user.id);

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
};

module.exports = {
  login,
  register,
  sanitizeUser,
};
