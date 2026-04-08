const cleanPublicEnvValue = (value) => String(value || '').replace(/\\r\\n/g, '').trim();

export const publicEnv = {
  apiUrl: cleanPublicEnvValue(import.meta.env.VITE_API_URL),
  supabaseUrl: cleanPublicEnvValue(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: cleanPublicEnvValue(
    import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  ),
  webPushPublicKey: cleanPublicEnvValue(import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY),
  googleAnalyticsId: cleanPublicEnvValue(import.meta.env.VITE_GA_MEASUREMENT_ID),
  googleSiteVerification: cleanPublicEnvValue(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION),
};

export const publicEnvFlags = {
  hasApiUrl: Boolean(publicEnv.apiUrl),
  hasSupabaseBrowserConfig: Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey),
  hasWebPushPublicKey: Boolean(publicEnv.webPushPublicKey),
  hasGoogleAnalytics: Boolean(publicEnv.googleAnalyticsId),
};
