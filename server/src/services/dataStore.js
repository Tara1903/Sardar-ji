const { assertSupabaseConfigured, supabaseAdmin } = require('../config/supabase');
const { getFallbackImageByCategory } = require('../utils/fallbackImages');
const { slugify } = require('../utils/helpers');

const ensureSupabase = () => {
  assertSupabaseConfigured();
  return supabaseAdmin;
};

const unwrap = ({ data, error }, message = 'Supabase request failed.') => {
  if (error) {
    throw new Error(error.message || message);
  }

  return data;
};

const normalizeCategory = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description || '',
  sortOrder: row.sort_order || 0,
  isActive: row.is_active !== false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeProduct = (row, categoryName = '') => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  price: Number(row.price || 0),
  description: row.description || '',
  category: categoryName || row.category || '',
  image: row.image_url || row.image || getFallbackImageByCategory(categoryName || row.category),
  badge: row.badge || '',
  isAvailable: row.is_available !== false,
  isVeg: row.is_veg !== false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phoneNumber: row.phone_number || '',
  role: row.role,
  referralCode: row.referral_code,
  referralApplied: row.referral_applied || '',
  successfulReferrals: row.successful_referrals || [],
  addresses: row.addresses || [],
  avatarUrl: row.avatar_url || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeSettings = (row) => ({
  id: 'business-settings',
  businessName: row.business_name,
  tagline: row.tagline,
  whatsappNumber: row.whatsapp_number,
  phoneNumber: row.phone_number,
  timings: row.timings,
  mapsEmbedUrl: row.maps_embed_url || '',
  trustPoints: row.trust_points || [],
  deliveryRules: row.delivery_rules || {},
  offers: row.offers || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  userId: row.user_id,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  items: row.items || [],
  address: row.address || {},
  paymentMethod: row.payment_method,
  note: row.note || '',
  subtotal: Number(row.subtotal || 0),
  deliveryFee: Number(row.delivery_fee || 0),
  handlingFee: Number(row.handling_fee || 0),
  discount: Number(row.discount || 0),
  total: Number(row.total || 0),
  status: row.status,
  estimatedDeliveryAt: row.estimated_delivery_at,
  deliveredAt: row.delivered_at,
  assignedDeliveryBoyId: row.assigned_delivery_boy_id || '',
  assignedDeliveryBoyName: row.assigned_delivery_boy_name || '',
  tracking: row.tracking || { timeline: [], currentLocation: null },
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

class DataStore {
  async init() {
    ensureSupabase();
  }

  async getCategoryById(id) {
    const supabase = ensureSupabase();
    const row = unwrap(
      await supabase.from('categories').select('*').eq('id', id).maybeSingle(),
      'Unable to load category.',
    );

    return row ? normalizeCategory(row) : null;
  }

  async findCategory(value) {
    const supabase = ensureSupabase();
    const direct = unwrap(
      await supabase.from('categories').select('*').eq('name', value).maybeSingle(),
      'Unable to load category.',
    );

    if (direct) {
      return normalizeCategory(direct);
    }

    const slug = slugify(value);
    const bySlug = unwrap(
      await supabase.from('categories').select('*').eq('slug', slug).maybeSingle(),
      'Unable to load category.',
    );

    return bySlug ? normalizeCategory(bySlug) : null;
  }

  async list(collection) {
    if (collection === 'products') {
      return this.getProducts();
    }

    if (collection === 'categories') {
      const supabase = ensureSupabase();
      const rows = unwrap(
        await supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        'Unable to load categories.',
      );

      return rows.map(normalizeCategory);
    }

    if (collection === 'users') {
      return this.getUsersByRole();
    }

    if (collection === 'orders') {
      return this.getOrders();
    }

    throw new Error(`Unsupported collection: ${collection}`);
  }

  async getSettings() {
    const supabase = ensureSupabase();
    const row = unwrap(
      await supabase.from('app_settings').select('*').eq('id', 1).single(),
      'Unable to load business settings.',
    );

    return normalizeSettings(row);
  }

  async updateSettings(partial) {
    const supabase = ensureSupabase();
    const current = await this.getSettings();
    const merged = {
      ...current,
      ...partial,
      deliveryRules: {
        ...(current.deliveryRules || {}),
        ...(partial.deliveryRules || {}),
      },
      offers: partial.offers || current.offers,
      trustPoints: partial.trustPoints || current.trustPoints,
    };

    const row = unwrap(
      await supabase
        .from('app_settings')
        .update({
          business_name: merged.businessName,
          tagline: merged.tagline,
          whatsapp_number: merged.whatsappNumber,
          phone_number: merged.phoneNumber,
          timings: merged.timings,
          maps_embed_url: merged.mapsEmbedUrl || '',
          trust_points: merged.trustPoints || [],
          delivery_rules: merged.deliveryRules || {},
          offers: merged.offers || [],
        })
        .eq('id', 1)
        .select('*')
        .single(),
      'Unable to update business settings.',
    );

    return normalizeSettings(row);
  }

  async getProducts(filters = {}) {
    const supabase = ensureSupabase();
    const rows = unwrap(
      await supabase.rpc('fetch_products', {
        p_search: filters.search?.trim() || null,
        p_category: filters.category && filters.category !== 'All' ? filters.category : null,
        p_available:
          filters.isAvailable === undefined ? null : String(filters.isAvailable) === 'true',
      }),
      'Unable to load products.',
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price || 0),
      description: row.description || '',
      category: row.category,
      image: row.image || getFallbackImageByCategory(row.category),
      badge: row.badge || '',
      isAvailable: row.is_available !== false,
      createdAt: row.created_at,
    }));
  }

  async getProductById(id) {
    const supabase = ensureSupabase();
    const row = unwrap(
      await supabase.from('products').select('*').eq('id', id).maybeSingle(),
      'Unable to load product.',
    );

    if (!row) {
      return null;
    }

    const category = await this.getCategoryById(row.category_id);
    return normalizeProduct(row, category?.name);
  }

  async createProduct(payload) {
    const supabase = ensureSupabase();
    const category = await this.findCategory(payload.category);
    if (!category) {
      throw new Error('Selected category was not found.');
    }

    const row = unwrap(
      await supabase
        .from('products')
        .insert({
          category_id: category.id,
          name: payload.name,
          slug: slugify(payload.name),
          price: payload.price,
          description: payload.description,
          image_url: payload.image || getFallbackImageByCategory(category.name),
          badge: payload.badge || '',
          is_available: payload.isAvailable !== false,
          is_veg: true,
        })
        .select('*')
        .single(),
      'Unable to create product.',
    );

    return normalizeProduct(row, category.name);
  }

  async updateProduct(id, payload) {
    const supabase = ensureSupabase();
    const current = await this.getProductById(id);
    if (!current) {
      throw new Error('Product not found.');
    }

    const category = payload.category ? await this.findCategory(payload.category) : null;
    const nextCategoryName = category?.name || current.category;
    const update = {};

    if (payload.name !== undefined) {
      update.name = payload.name;
      update.slug = slugify(payload.name);
    }

    if (payload.price !== undefined) {
      update.price = payload.price;
    }

    if (payload.description !== undefined) {
      update.description = payload.description;
    }

    if (payload.category !== undefined) {
      if (!category) {
        throw new Error('Selected category was not found.');
      }

      update.category_id = category.id;
    }

    if (payload.image !== undefined) {
      update.image_url = payload.image || getFallbackImageByCategory(nextCategoryName);
    }

    if (payload.badge !== undefined) {
      update.badge = payload.badge;
    }

    if (payload.isAvailable !== undefined) {
      update.is_available = payload.isAvailable;
    }

    const row = unwrap(
      await supabase.from('products').update(update).eq('id', id).select('*').single(),
      'Unable to update product.',
    );

    return normalizeProduct(row, nextCategoryName);
  }

  async deleteProduct(id) {
    const supabase = ensureSupabase();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      throw new Error(error.message || 'Unable to delete product.');
    }
  }

  async createCategory(payload) {
    const supabase = ensureSupabase();
    const row = unwrap(
      await supabase
        .from('categories')
        .insert({
          name: payload.name,
          slug: slugify(payload.name),
          description: payload.description || '',
          sort_order: 99,
          is_active: true,
        })
        .select('*')
        .single(),
      'Unable to create category.',
    );

    return normalizeCategory(row);
  }

  async getUserById(id) {
    const supabase = ensureSupabase();
    const row = unwrap(
      await supabase.from('users').select('*').eq('id', id).maybeSingle(),
      'Unable to load user.',
    );

    return row ? normalizeUser(row) : null;
  }

  async getUserByEmail(email) {
    const supabase = ensureSupabase();
    const normalizedEmail = email.trim().toLowerCase();
    const row = unwrap(
      await supabase.from('users').select('*').ilike('email', normalizedEmail).maybeSingle(),
      'Unable to load user.',
    );

    return row ? normalizeUser(row) : null;
  }

  async updateUser(id, payload) {
    const supabase = ensureSupabase();
    const update = {};

    if (payload.name !== undefined) {
      update.name = payload.name;
    }

    if (payload.phoneNumber !== undefined) {
      update.phone_number = payload.phoneNumber;
    }

    if (payload.role !== undefined) {
      update.role = payload.role;
    }

    if (payload.referralApplied !== undefined) {
      update.referral_applied = payload.referralApplied;
    }

    if (payload.successfulReferrals !== undefined) {
      update.successful_referrals = payload.successfulReferrals;
    }

    if (payload.addresses !== undefined) {
      update.addresses = payload.addresses;
    }

    if (payload.avatarUrl !== undefined) {
      update.avatar_url = payload.avatarUrl;
    }

    const row = unwrap(
      await supabase.from('users').update(update).eq('id', id).select('*').single(),
      'Unable to update user.',
    );

    return normalizeUser(row);
  }

  async getUsersByRole(role) {
    const supabase = ensureSupabase();
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const rows = unwrap(await query, 'Unable to load users.');
    return rows.map(normalizeUser);
  }

  async createOrder(payload) {
    const supabase = ensureSupabase();
    const productIds = [...new Set(payload.items.map((item) => item.id))];
    const productRows = unwrap(
      await supabase
        .from('products')
        .select('id, name, price, image_url, category_id, is_available')
        .in('id', productIds),
      'Unable to validate cart items.',
    );

    const categoryRows = productRows.length
      ? unwrap(
          await supabase
            .from('categories')
            .select('id, name')
            .in(
              'id',
              [...new Set(productRows.map((row) => row.category_id).filter(Boolean))],
            ),
          'Unable to load categories for cart items.',
        )
      : [];

    const categoryMap = new Map(categoryRows.map((row) => [row.id, row.name]));
    const productMap = new Map(productRows.map((row) => [row.id, row]));

    const canonicalItems = payload.items.map((item) => {
      const product = productMap.get(item.id);
      if (!product) {
        throw new Error('One or more cart items are no longer available.');
      }

      if (!product.is_available) {
        throw new Error(`${product.name} is currently unavailable.`);
      }

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        image:
          product.image_url || getFallbackImageByCategory(categoryMap.get(product.category_id) || ''),
        quantity: Number(item.quantity || 1),
      };
    });

    const result = unwrap(
      await supabase.rpc('place_order', {
        p_user_id: payload.userId,
        p_address: payload.address,
        p_payment_method: payload.paymentMethod || 'COD',
        p_items: canonicalItems,
        p_note: payload.note || '',
      }),
      'Unable to place order.',
    );

    return this.getOrderById(result.id);
  }

  async getOrderById(id) {
    const supabase = ensureSupabase();
    const row = unwrap(
      await supabase.from('orders').select('*').eq('id', id).maybeSingle(),
      'Unable to load order.',
    );

    return row ? normalizeOrder(row) : null;
  }

  async updateOrderStatus(id, payload) {
    const supabase = ensureSupabase();
    unwrap(
      await supabase.rpc('update_order_status', {
        p_order_id: id,
        p_status: payload.status,
        p_assigned_delivery_user_id: payload.assignedDeliveryBoyId || null,
        p_actor_user_id: payload.actorUserId || null,
      }),
      'Unable to update order status.',
    );

    return this.getOrderById(id);
  }

  async trackDelivery(orderId, payload) {
    const supabase = ensureSupabase();
    unwrap(
      await supabase.rpc('track_delivery', {
        p_order_id: orderId,
        p_delivery_user_id: payload.deliveryUserId,
        p_latitude: payload.latitude,
        p_longitude: payload.longitude,
        p_eta_minutes: payload.etaMinutes || null,
        p_status_note: payload.statusNote || '',
      }),
      'Unable to update delivery tracking.',
    );

    return this.getOrderById(orderId);
  }

  async getOrders() {
    const supabase = ensureSupabase();
    const rows = unwrap(
      await supabase.from('orders').select('*').order('created_at', { ascending: false }),
      'Unable to load orders.',
    );

    return rows.map(normalizeOrder);
  }

  async applyReferralCode(userId, referralCode) {
    const supabase = ensureSupabase();
    return unwrap(
      await supabase.rpc('apply_referral_code', {
        p_user_id: userId,
        p_referral_code: referralCode,
      }),
      'Unable to apply referral code.',
    );
  }
}

module.exports = {
  dataStore: new DataStore(),
};
