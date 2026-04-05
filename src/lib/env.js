export const publicEnv = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    '',
  googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
  googleSiteVerification: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '',
};

export const publicEnvFlags = {
  hasApiUrl: Boolean(publicEnv.apiUrl),
  hasSupabaseBrowserConfig: Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey),
  hasGoogleAnalytics: Boolean(publicEnv.googleAnalyticsId),
};
