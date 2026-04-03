export const publicEnv = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const publicEnvFlags = {
  hasApiUrl: Boolean(publicEnv.apiUrl),
  hasSupabaseBrowserConfig: Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey),
};
