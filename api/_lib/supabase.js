import { getEnv } from './server.js';
import { PUBLIC_SUPABASE_CONFIG } from './public-config.js';

const getSupabaseConfig = () => {
  const url =
    getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') ||
    PUBLIC_SUPABASE_CONFIG.url;
  const anonKey =
    getEnv(
      'SUPABASE_ANON_KEY',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    ) || PUBLIC_SUPABASE_CONFIG.anonKey;

  if (!url || !anonKey) {
    const error = new Error('Supabase REST configuration is missing.');
    error.statusCode = 500;
    throw error;
  }

  return { url, anonKey };
};

const restRequest = async ({ path, token = '', method = 'GET', body, headers = {} }) => {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error_description || 'Supabase request failed.');
    error.statusCode = response.status || 500;
    throw error;
  }

  return payload;
};

export const callSupabaseRpc = ({ fn, body, token }) =>
  restRequest({
    path: `/rpc/${fn}`,
    method: 'POST',
    body,
    token,
  });

export const getSupabaseRows = ({ path, token }) =>
  restRequest({
    path,
    token,
  });
