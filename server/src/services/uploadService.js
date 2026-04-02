const path = require('path');
const { randomUUID } = require('crypto');
const { env } = require('../config/env');
const { assertSupabaseConfigured, supabaseAdmin } = require('../config/supabase');

const saveImage = async (file) => {
  if (!file) {
    throw new Error('No file provided.');
  }

  assertSupabaseConfigured();

  const extension = path.extname(file.originalname) || '.jpg';
  const fileName = `products/${randomUUID()}${extension}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(env.supabaseProductImagesBucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Unable to upload product image.');
  }

  const { data } = supabaseAdmin.storage
    .from(env.supabaseProductImagesBucket)
    .getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    provider: 'supabase-storage',
  };
};

module.exports = {
  saveImage,
};
