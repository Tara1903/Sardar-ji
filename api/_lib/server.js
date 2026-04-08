import { PUBLIC_SUPABASE_CONFIG } from './public-config.js';

const parseJsonSafely = (value, fallback = {}) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const sanitizeEnvValue = (value = '') =>
  String(value || '')
    .replace(/\\r\\n/g, '')
    .replace(/\r?\n/g, '')
    .trim();

export const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return parseJsonSafely(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return parseJsonSafely(Buffer.concat(chunks).toString('utf8'));
};

export const getEnv = (...names) =>
  names
    .map((name) => sanitizeEnvValue(process.env[name]))
    .find((value) => value) || '';

export const getBearerToken = (req) => {
  const authorization = req.headers.authorization || req.headers.Authorization || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorization.slice(7).trim();
};

export const requireAuthenticatedUser = async (req) => {
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const supabaseUrl =
    getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') ||
    PUBLIC_SUPABASE_CONFIG.url;
  const supabaseAnonKey = getEnv(
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  ) || PUBLIC_SUPABASE_CONFIG.anonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error('Supabase server configuration is missing.');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  return response.json();
};
