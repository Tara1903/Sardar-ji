import { createClient } from '@supabase/supabase-js';
import { publicEnv, publicEnvFlags } from './env';

let supabaseBrowserClient = null;

export const getSupabaseBrowserClient = () => {
  if (!publicEnvFlags.hasSupabaseBrowserConfig) {
    return null;
  }

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    );
  }

  return supabaseBrowserClient;
};
