import { getFallbackImage } from '../data/fallbackImages';
import { publicEnv, publicEnvFlags } from '../lib/env';

const API_URL = publicEnv.apiUrl.trim();
const USE_API_SERVER = Boolean(API_URL);

const defaultTracking = {
  timeline: [],
  currentLocation: null,
};

const request = async (path, options = {}) => {
  const { token, body, headers, method = 'GET', isForm = false } = options;

  if (!USE_API_SERVER) {
    throw new Error('The API server is not configured for this deployment.');
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error('Unable to reach the server. Check the API URL and deployment status.');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const getSupabase = async () => {
  if (!publicEnvFlags.hasSupabaseBrowserConfig) {
    throw new Error(
      'This deployment needs either VITE_API_URL or both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }

  const { getSupabaseBrowserClient } = await import('../lib/supabase');
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Unable to initialize the Supabase browser client.');
  }

  return client;
};

const delay = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const createError = (error, fallback) => new Error(error?.message || fallback);

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

const normalizeProduct = (row) => {
  const category = row.categories?.name || row.category || '';

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    price: Number(row.price || 0),
    description: row.description || '',
    category,
    categorySlug: row.categories?.slug || '',
    image: row.image_url || row.image || getFallbackImage(category),
    badge: row.badge || '',
    isAvailable: row.is_available !== false,
    isVeg: row.is_veg !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

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

const normalizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phoneNumber: row.phone_number || '',
  role: row.role,
  referralCode: row.referral_code || '',
  referralApplied: row.referral_applied || '',
  successfulReferrals: row.successful_referrals || [],
  addresses: row.addresses || [],
  avatarUrl: row.avatar_url || '',
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
  tracking: row.tracking || defaultTracking,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeTracking = (row) => ({
  id: row.orderId,
  orderNumber: row.orderNumber,
  status: row.status,
  estimatedDeliveryAt: row.estimatedDeliveryAt,
  tracking: {
    timeline: row.timeline || [],
    currentLocation: row.currentLocation || null,
  },
});

const buildReferralProgress = (user) => {
  const referralCount = user.successfulReferrals?.length || 0;

  return {
    referralCode: user.referralCode,
    successfulReferralCount: referralCount,
    milestones: [
      {
        target: 6,
        title: '1 Month FREE',
        unlocked: referralCount >= 6,
      },
      {
        target: 12,
        title: '1 Month FREE + Rs 1500 coupon',
        unlocked: referralCount >= 12,
      },
    ],
  };
};

const getCurrentUser = async (supabase, token) => {
  const { data, error } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  if (error || !data?.user) {
    throw new Error('Authentication required.');
  }

  return data.user;
};

const waitForProfile = async (supabase, userId) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return normalizeUser(data);
    }

    await delay(150);
  }

  throw new Error('User profile not found.');
};

const getProfile = async (supabase, userId) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) {
    throw createError(error, 'Unable to load the user profile.');
  }

  return normalizeUser(data);
};

const getCategoryRecord = async (supabase, value) => {
  const cleaned = String(value || '').trim();

  let response = await supabase.from('categories').select('*').eq('name', cleaned).maybeSingle();
  if (!response.error && response.data) {
    return response.data;
  }

  response = await supabase.from('categories').select('*').eq('slug', cleaned).maybeSingle();
  if (!response.error && response.data) {
    return response.data;
  }

  throw new Error('Category not found.');
};

const getOrderRecord = async (supabase, orderId) => {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();

  if (error) {
    throw createError(error, 'Unable to load the order.');
  }

  return normalizeOrder(data);
};

const saveAddressIfNew = async (supabase, user, address) => {
  const existing = (user.addresses || []).find(
    (savedAddress) =>
      savedAddress.fullAddress === address.fullAddress &&
      savedAddress.phoneNumber === address.phoneNumber &&
      savedAddress.pincode === address.pincode,
  );

  if (existing) {
    return user;
  }

  const nextAddresses = [
    ...(user.addresses || []),
    {
      id: `address-${Date.now()}`,
      ...address,
    },
  ];

  const { data, error } = await supabase
    .from('users')
    .update({ addresses: nextAddresses })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    throw createError(error, 'Unable to save the delivery address.');
  }

  return normalizeUser(data);
};

const direct = {
  getSettings: async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      throw createError(error, 'Unable to load business settings.');
    }

    return normalizeSettings(data);
  },

  updateSettings: async (payload) => {
    const supabase = await getSupabase();
    const current = await direct.getSettings();
    const merged = {
      ...current,
      ...payload,
      deliveryRules: {
        ...(current.deliveryRules || {}),
        ...(payload.deliveryRules || {}),
      },
      offers: payload.offers || current.offers,
      trustPoints: payload.trustPoints || current.trustPoints,
    };

    const { data, error } = await supabase
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
      .single();

    if (error) {
      throw createError(error, 'Unable to update business settings.');
    }

    return normalizeSettings(data);
  },

  getProducts: async (params = {}) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error, 'Unable to load products.');
    }

    let products = data.map(normalizeProduct);

    if (params.category && params.category !== 'All') {
      const categoryQuery = params.category.toLowerCase();
      products = products.filter(
        (product) =>
          product.category.toLowerCase() === categoryQuery ||
          product.categorySlug.toLowerCase() === categoryQuery,
      );
    }

    if (params.search) {
      const query = params.search.toLowerCase();
      products = products.filter((product) =>
        `${product.name} ${product.description}`.toLowerCase().includes(query),
      );
    }

    if (params.isAvailable !== undefined) {
      const isAvailable = String(params.isAvailable) === 'true';
      products = products.filter((product) => product.isAvailable === isAvailable);
    }

    return products;
  },

  getProduct: async (id) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', id)
      .single();

    if (error) {
      throw createError(error, 'Product not found.');
    }

    return normalizeProduct(data);
  },

  createProduct: async (payload) => {
    const supabase = await getSupabase();
    const category = await getCategoryRecord(supabase, payload.category);
    const { data, error } = await supabase
      .from('products')
      .insert({
        category_id: category.id,
        name: payload.name,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        price: Number(payload.price),
        description: payload.description,
        image_url: payload.image || getFallbackImage(category.name),
        badge: payload.badge || '',
        is_available: payload.isAvailable !== false,
        is_veg: true,
      })
      .select('*, categories(name, slug)')
      .single();

    if (error) {
      throw createError(error, 'Unable to create the product.');
    }

    return normalizeProduct(data);
  },

  updateProduct: async (id, payload) => {
    const supabase = await getSupabase();
    const update = {};

    if (payload.name !== undefined) {
      update.name = payload.name;
      update.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    if (payload.price !== undefined) {
      update.price = Number(payload.price);
    }

    if (payload.description !== undefined) {
      update.description = payload.description;
    }

    if (payload.badge !== undefined) {
      update.badge = payload.badge;
    }

    if (payload.isAvailable !== undefined) {
      update.is_available = Boolean(payload.isAvailable);
    }

    if (payload.image !== undefined) {
      update.image_url = payload.image;
    }

    if (payload.category !== undefined) {
      const category = await getCategoryRecord(supabase, payload.category);
      update.category_id = category.id;
      if (!update.image_url) {
        update.image_url = getFallbackImage(category.name);
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(update)
      .eq('id', id)
      .select('*, categories(name, slug)')
      .single();

    if (error) {
      throw createError(error, 'Unable to update the product.');
    }

    return normalizeProduct(data);
  },

  deleteProduct: async (id) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw createError(error, 'Unable to delete the product.');
    }

    return null;
  },

  getCategories: async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw createError(error, 'Unable to load categories.');
    }

    return data.map(normalizeCategory);
  },

  createCategory: async (payload) => {
    const supabase = await getSupabase();
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: payload.name,
        slug,
        description: payload.description || '',
        sort_order: 99,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) {
      throw createError(error, 'Unable to create the category.');
    }

    return normalizeCategory(data);
  },

  login: async (payload) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    if (error || !data?.session) {
      throw new Error('Invalid email or password.');
    }

    const user = await waitForProfile(supabase, data.user.id);
    return {
      token: data.session.access_token,
      user,
    };
  },

  register: async (payload) => {
    const supabase = await getSupabase();
    const role = payload.role && payload.role !== 'customer' ? 'customer' : 'customer';
    const registerResponse = await supabase.auth.signUp({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          phoneNumber: payload.phoneNumber,
          role,
        },
      },
    });

    if (registerResponse.error || !registerResponse.data.user) {
      throw createError(registerResponse.error, 'Unable to create the account.');
    }

    let session = registerResponse.data.session;

    if (!session) {
      const loginResponse = await supabase.auth.signInWithPassword({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      if (loginResponse.error || !loginResponse.data.session) {
        throw createError(loginResponse.error, 'Unable to sign in after registration.');
      }

      session = loginResponse.data.session;
    }

    let user = await waitForProfile(supabase, registerResponse.data.user.id);

    if (payload.referralCode) {
      try {
        await direct.applyReferral(payload.referralCode, session.access_token);
        user = await getProfile(supabase, registerResponse.data.user.id);
      } catch {
        user = await getProfile(supabase, registerResponse.data.user.id);
      }
    }

    return {
      token: session.access_token,
      user,
    };
  },

  me: async (token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);
    const user = await getProfile(supabase, authUser.id);

    return { user };
  },

  updateAddresses: async (addresses, token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);
    const { data, error } = await supabase
      .from('users')
      .update({ addresses })
      .eq('id', authUser.id)
      .select('*')
      .single();

    if (error) {
      throw createError(error, 'Unable to update addresses.');
    }

    return { user: normalizeUser(data) };
  },

  getUsers: async (role, token) => {
    const supabase = await getSupabase();
    await getCurrentUser(supabase, token);

    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      throw createError(error, 'Unable to load users.');
    }

    return data.map(normalizeUser);
  },

  getOrders: async (token, search = '') => {
    const supabase = await getSupabase();
    await getCurrentUser(supabase, token);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error, 'Unable to load orders.');
    }

    let orders = data.map(normalizeOrder);

    if (search) {
      const query = search.toLowerCase();
      orders = orders.filter((order) =>
        `${order.orderNumber} ${order.customerName}`.toLowerCase().includes(query),
      );
    }

    return orders;
  },

  placeOrder: async (payload, token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);

    if (!payload?.items?.length) {
      throw new Error('Add at least one item before placing the order.');
    }

    const { data, error } = await supabase.rpc('place_order', {
      p_user_id: authUser.id,
      p_address: payload.address,
      p_payment_method: payload.paymentMethod || 'COD',
      p_items: payload.items,
      p_note: payload.note || '',
    });

    if (error || !data?.id) {
      throw createError(error, 'Unable to place the order.');
    }

    const profile = await getProfile(supabase, authUser.id);
    await saveAddressIfNew(supabase, profile, payload.address);

    return getOrderRecord(supabase, data.id);
  },

  updateOrderStatus: async (id, payload, token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: id,
      p_status: payload.status,
      p_assigned_delivery_user_id: payload.assignedDeliveryBoyId || null,
      p_actor_user_id: authUser.id,
    });

    if (error) {
      throw createError(error, 'Unable to update the order status.');
    }

    return getOrderRecord(supabase, id);
  },

  getTracking: async (orderId) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc('get_delivery_tracking', {
      p_order_id: orderId,
    });

    if (error || !data) {
      throw createError(error, 'Tracking is unavailable for this order.');
    }

    return normalizeTracking(data);
  },

  getReferralProgress: async (token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);
    const user = await getProfile(supabase, authUser.id);
    return buildReferralProgress(user);
  },

  applyReferral: async (referralCode, token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);
    const { error } = await supabase.rpc('apply_referral_code', {
      p_user_id: authUser.id,
      p_referral_code: referralCode.trim(),
    });

    if (error) {
      throw createError(error, 'Unable to apply the referral code.');
    }

    const user = await getProfile(supabase, authUser.id);
    return buildReferralProgress(user);
  },

  uploadImage: async (file, token) => {
    const supabase = await getSupabase();
    await getCurrentUser(supabase, token);

    if (!file) {
      throw new Error('Select an image before uploading.');
    }

    const extension = file.name?.split('.').pop() || 'jpg';
    const fileName = `products/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw createError(error, 'Unable to upload the image.');
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);

    return {
      url: data.publicUrl,
      provider: 'supabase-storage',
    };
  },

  updateDeliveryLocation: async (payload, token) => {
    const supabase = await getSupabase();
    const authUser = await getCurrentUser(supabase, token);
    const { error } = await supabase.rpc('track_delivery', {
      p_order_id: payload.orderId,
      p_delivery_user_id: authUser.id,
      p_latitude: payload.latitude,
      p_longitude: payload.longitude,
      p_eta_minutes: null,
      p_status_note: '',
    });

    if (error) {
      throw createError(error, 'Unable to update live delivery location.');
    }

    return getOrderRecord(supabase, payload.orderId);
  },
};

export const api = {
  getSettings: () => (USE_API_SERVER ? request('/settings') : direct.getSettings()),
  updateSettings: (payload, token) =>
    USE_API_SERVER
      ? request('/settings', { method: 'PUT', body: payload, token })
      : direct.updateSettings(payload, token),
  getProducts: (params = {}) => {
    if (!USE_API_SERVER) {
      return direct.getProducts(params);
    }

    const searchParams = new URLSearchParams(params).toString();
    return request(`/products${searchParams ? `?${searchParams}` : ''}`);
  },
  getProduct: (id) => (USE_API_SERVER ? request(`/products/${id}`) : direct.getProduct(id)),
  createProduct: (payload, token) =>
    USE_API_SERVER
      ? request('/products', { method: 'POST', body: payload, token })
      : direct.createProduct(payload, token),
  updateProduct: (id, payload, token) =>
    USE_API_SERVER
      ? request(`/products/${id}`, { method: 'PUT', body: payload, token })
      : direct.updateProduct(id, payload, token),
  deleteProduct: (id, token) =>
    USE_API_SERVER ? request(`/products/${id}`, { method: 'DELETE', token }) : direct.deleteProduct(id, token),
  getCategories: () => (USE_API_SERVER ? request('/categories') : direct.getCategories()),
  createCategory: (payload, token) =>
    USE_API_SERVER
      ? request('/categories', { method: 'POST', body: payload, token })
      : direct.createCategory(payload, token),
  login: (payload) => (USE_API_SERVER ? request('/auth/login', { method: 'POST', body: payload }) : direct.login(payload)),
  register: (payload) =>
    USE_API_SERVER ? request('/auth/register', { method: 'POST', body: payload }) : direct.register(payload),
  me: (token) => (USE_API_SERVER ? request('/auth/me', { token }) : direct.me(token)),
  updateAddresses: (addresses, token) =>
    USE_API_SERVER
      ? request('/auth/addresses', { method: 'PUT', body: { addresses }, token })
      : direct.updateAddresses(addresses, token),
  getUsers: (role, token) =>
    USE_API_SERVER ? request(`/auth/users${role ? `?role=${role}` : ''}`, { token }) : direct.getUsers(role, token),
  getOrders: (token, search = '') =>
    USE_API_SERVER
      ? request(`/orders${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token })
      : direct.getOrders(token, search),
  placeOrder: (payload, token) =>
    USE_API_SERVER
      ? request('/orders', { method: 'POST', body: payload, token })
      : direct.placeOrder(payload, token),
  updateOrderStatus: (id, payload, token) =>
    USE_API_SERVER
      ? request(`/orders/${id}/status`, { method: 'PUT', body: payload, token })
      : direct.updateOrderStatus(id, payload, token),
  getTracking: (orderId) => (USE_API_SERVER ? request(`/tracking/${orderId}`) : direct.getTracking(orderId)),
  getReferralProgress: (token) =>
    USE_API_SERVER ? request('/referral/me', { token }) : direct.getReferralProgress(token),
  applyReferral: (referralCode, token) =>
    USE_API_SERVER
      ? request('/referral/apply', { method: 'POST', body: { referralCode }, token })
      : direct.applyReferral(referralCode, token),
  uploadImage: (file, token) => {
    if (!USE_API_SERVER) {
      return direct.uploadImage(file, token);
    }

    const formData = new FormData();
    formData.append('image', file);
    return request('/upload/image', { method: 'POST', body: formData, token, isForm: true });
  },
  updateDeliveryLocation: (payload, token) =>
    USE_API_SERVER
      ? request('/delivery/location-update', { method: 'POST', body: payload, token })
      : direct.updateDeliveryLocation(payload, token),
};
