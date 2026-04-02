const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

const createServerClient = (key) =>
  createClient(env.supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

const supabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey && env.supabaseAnonKey,
);

const supabaseAdmin =
  env.supabaseUrl && env.supabaseServiceRoleKey
    ? createServerClient(env.supabaseServiceRoleKey)
    : null;

const supabaseAuth =
  env.supabaseUrl && env.supabaseAnonKey ? createServerClient(env.supabaseAnonKey) : null;

const assertSupabaseConfigured = () => {
  if (!supabaseConfigured || !supabaseAdmin || !supabaseAuth) {
    throw new Error(
      'Supabase environment variables are missing. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
};

module.exports = {
  assertSupabaseConfigured,
  supabaseAdmin,
  supabaseAuth,
  supabaseConfigured,
};
