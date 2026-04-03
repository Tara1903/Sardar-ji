import { createClient } from '@supabase/supabase-js';
import { publicEnv, publicEnvFlags } from './env';

let supabaseBrowserClient = null;

const browserAuthOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

const transientAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
};

export const getSupabaseBrowserClient = () => {
  if (!publicEnvFlags.hasSupabaseBrowserConfig) {
    return null;
  }

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
      auth: browserAuthOptions,
    });
  }

  return supabaseBrowserClient;
};

export const createTransientSupabaseClient = () => {
  if (!publicEnvFlags.hasSupabaseBrowserConfig) {
    return null;
  }

  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: {
      ...transientAuthOptions,
      storageKey: `sjfc-otp-${Math.random().toString(36).slice(2)}`,
    },
  });
};
