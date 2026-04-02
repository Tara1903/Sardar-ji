const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  allowedOrigins: process.env.ALLOWED_ORIGINS || '',
  jwtSecret: process.env.JWT_SECRET || 'sardar-ji-development-secret',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseProductImagesBucket: process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images',
  supabaseUserUploadsBucket: process.env.SUPABASE_USER_UPLOADS_BUCKET || 'user-uploads',
  isVercel: Boolean(process.env.VERCEL),
};

module.exports = { env };
