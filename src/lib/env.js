export const publicEnv = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const publicEnvFlags = {
  hasApiUrl: Boolean(publicEnv.apiUrl),
  hasGoogleMapsApiKey: Boolean(publicEnv.googleMapsApiKey),
  hasSupabaseBrowserConfig: Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey),
};
