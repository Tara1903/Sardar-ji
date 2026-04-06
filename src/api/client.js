import { getFallbackImage } from '../data/fallbackImages';
import { publicEnv, publicEnvFlags } from '../lib/env';
import {
  createTokenSupabaseClient,
  createTransientSupabaseClient,
  getSupabaseBrowserClient,
} from '../lib/supabase';
import {
  DEFAULT_PHONE_NUMBER,
  DEFAULT_WHATSAPP_NUMBER,
  normalizePhoneDisplay,
  normalizeWhatsappNumber,
} from '../utils/contact';
import {
  clearOtpRequest,
  formatOtpDuration,
  getOtpRequestState,
  storeOtpRequest,
} from '../utils/otpState';
import { defaultDeliveryRules } from '../utils/pricing';
import {
  DEFAULT_OFFERS,
  DEFAULT_TRUST_POINTS,
  STORE_MAP_EMBED_URL,
} from '../utils/storefront';
import {
  isMonthlySubscriptionProduct,
  MONTHLY_SUBSCRIPTION_DURATION_DAYS,
  MONTHLY_SUBSCRIPTION_PLAN_NAME,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../utils/subscription';
import { mergeStorefrontConfig } from '../theme/theme';
import { normalizeEmail } from '../utils/validation';

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

const requestAppRoute = async (path, options = {}) => {
  const { token, body, headers, method = 'GET' } = options;

  let response;

  try {
    response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Unable to reach the payment service right now. Please try again.');
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

  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error('Unable to initialize the Supabase browser client.');
  }

  return client;
};

const getTransientSupabase = () => {
  const client = createTransientSupabaseClient();

  if (!client) {
    throw new Error(
      'This deployment needs either VITE_API_URL or both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }

  return client;
};

const getSupabaseForToken = async (token) => {
  if (!token) {
    throw new Error('Authentication required.');
  }

  const client = createTokenSupabaseClient(token);

  if (!client) {
    throw new Error(
      'This deployment needs either VITE_API_URL or both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }

  return client;
};

const delay = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const createError = (error, fallback) => new Error(error?.message || fallback);

const isOtpRateLimitError = (error) =>
  error?.status === 429 ||
  /rate limit|too many requests|security purposes|over_email_send_rate_limit/i.test(
    `${error?.message || ''} ${error?.code || ''} ${error?.error_code || ''}`,
  );

const isOtpMailSendError = (error) =>
  /error sending .*email|confirmation email|unexpected_failure/i.test(
    `${error?.message || ''} ${error?.code || ''} ${error?.error_code || ''}`,
  );

const buildOtpResponse = ({ email, expiresAt, cooldownEndsAt, message, reused = false }) => ({
  email,
  expiresAt,
  cooldownEndsAt,
  reused,
  message,
});

const buildStoredOtpResponse = (scope, email, label) => {
  const requestState = getOtpRequestState(scope, email);

  if (!requestState) {
    return null;
  }

  if (requestState.cooldownRemainingSeconds > 0) {
    return buildOtpResponse({
      email,
      expiresAt: requestState.expiresAt,
      cooldownEndsAt: requestState.cooldownEndsAt,
      reused: true,
      message: `Please wait ${formatOtpDuration(requestState.cooldownRemainingSeconds)} before requesting another ${label}.`,
    });
  }

  return buildOtpResponse({
    email,
    expiresAt: requestState.expiresAt,
    cooldownEndsAt: requestState.cooldownEndsAt,
    reused: true,
    message: `The last ${label} sent to ${email} is still valid for ${formatOtpDuration(requestState.validRemainingSeconds)}.`,
  });
};

const buildFreshOtpResponse = (scope, email, message) => {
  const requestState = storeOtpRequest(scope, email);

  return buildOtpResponse({
    email,
    expiresAt: requestState?.expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    cooldownEndsAt: requestState?.cooldownEndsAt || new Date(Date.now() + 60 * 1000).toISOString(),
    message,
  });
};

const createOtpRequestError = (error, fallback) => {
  if (isOtpRateLimitError(error)) {
    return new Error(
      'Too many email codes were requested recently. Please wait a minute, then tap Send login code only once.',
    );
  }

  if (isOtpMailSendError(error)) {
    return new Error('We could not send your verification code right now. Please try again in a moment.');
  }

  return createError(error, fallback);
};

const createSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isDuplicateAuthResponse = (response) => {
  const user = response?.data?.user;
  const identities = user?.identities || [];

  return Boolean(
    user &&
      !response?.error &&
      !response?.data?.session &&
      Array.isArray(identities) &&
      identities.length === 0,
  );
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

const normalizeSettings = (row = {}) => {
  const rawDeliveryRules = row.delivery_rules || {};
  const storefront = mergeStorefrontConfig(rawDeliveryRules.storefront);
  const { storefront: _ignoredStorefront, ...cleanDeliveryRules } = rawDeliveryRules;

  return {
    id: 'business-settings',
    businessName: row.business_name || 'Sardar Ji Food Corner',
    tagline: row.tagline || 'Swad Bhi, Budget Bhi',
    whatsappNumber: normalizeWhatsappNumber(row.whatsapp_number || DEFAULT_WHATSAPP_NUMBER),
    phoneNumber: normalizePhoneDisplay(row.phone_number || DEFAULT_PHONE_NUMBER),
    timings: row.timings || 'Morning to Night',
    mapsEmbedUrl: row.maps_embed_url || STORE_MAP_EMBED_URL,
    trustPoints: row.trust_points?.length ? row.trust_points : DEFAULT_TRUST_POINTS,
    deliveryRules: {
      ...defaultDeliveryRules,
      ...(cleanDeliveryRules || {}),
    },
    offers: row.offers?.length ? row.offers : DEFAULT_OFFERS,
    storefront,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

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
  orderNumber: row.order_number || row.orderNumber || '',
  userId: row.user_id,
  customerName: row.customer_name || '',
  customerPhone: row.customer_phone || '',
  items: row.items || [],
  address: row.address || {},
  paymentMethod: row.payment_method || row.paymentMethod || 'COD',
  note: row.note || '',
  subtotal: Number(row.subtotal || 0),
  deliveryFee: Number(row.delivery_fee || 0),
  handlingFee: Number(row.handling_fee || 0),
  discount: Number(row.discount || 0),
  total: Number(row.total || 0),
  status: row.status,
  estimatedDeliveryAt: row.estimated_delivery_at || row.estimatedDeliveryAt,
  deliveredAt: row.delivered_at || row.deliveredAt,
  assignedDeliveryBoyId: row.assigned_delivery_boy_id || row.assignedDeliveryBoyId || '',
  assignedDeliveryBoyName: row.assigned_delivery_boy_name || row.assignedDeliveryBoyName || '',
  tracking: row.tracking || defaultTracking,
  createdAt: row.created_at || row.createdAt,
  updatedAt: row.updated_at || row.updatedAt,
});

const normalizeTracking = (row) => ({
  id: row.orderId || row.order_id || row.id,
  orderNumber: row.orderNumber || row.order_number || '',
  status: row.status,
  estimatedDeliveryAt: row.estimatedDeliveryAt || row.estimated_delivery_at,
  tracking: {
    timeline: row.timeline || row.tracking?.timeline || [],
    currentLocation:
      row.currentLocation || row.current_location || row.tracking?.currentLocation || null,
  },
});

const normalizeReferralEntry = (row) => ({
  id: row.id,
  referralCode: row.referral_code || row.referralCode || '',
  referredUserId: row.referred_user_id || row.referredUserId || '',
  status: row.status || 'pending',
  rewardType: row.reward_type || row.rewardType || '',
  rewardValue: Number(row.reward_value || row.rewardValue || 0),
  rewardCouponId: row.reward_coupon_id || row.rewardCouponId || '',
  createdAt: row.created_at || row.createdAt,
  updatedAt: row.updated_at || row.updatedAt,
});

const buildReferralProgress = (user, explicitReferralCount = null, referralEntries = []) => {
  const referralCount =
    typeof explicitReferralCount === 'number'
      ? explicitReferralCount
      : referralEntries.filter((entry) => entry.status === 'active_plan').length ||
        user.successfulReferrals?.length ||
        0;

  return {
    referralCode: user.referralCode,
    appliedReferralCode: user.referralApplied || '',
    activePlanReferralCount: referralCount,
    successfulReferralCount: referralCount,
    referralEntries,
    milestones: [
      {
        target: 6,
        title: '6 active monthly plan referrals = 1 Month FREE',
        unlocked: referralCount >= 6,
      },
      {
        target: 12,
        title: '12 active monthly plan referrals = 1 Month FREE + ₹1500 coupon',
        unlocked: referralCount >= 12,
      },
    ],
  };
};

const normalizeSubscription = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    planName: row.plan_name || row.planName || MONTHLY_SUBSCRIPTION_PLAN_NAME,
    startDate: row.start_date || row.startDate || '',
    endDate: row.end_date || row.endDate || '',
    status: row.status || 'expired',
    daysLeft: Number(row.days_left ?? row.daysLeft ?? 0),
    createdAt: row.created_at || row.createdAt || '',
    updatedAt: row.updated_at || row.updatedAt || '',
    price: Number(row.price || MONTHLY_SUBSCRIPTION_PRICE),
    durationDays: Number(row.duration_days || row.durationDays || MONTHLY_SUBSCRIPTION_DURATION_DAYS),
  };
};

const normalizeRewardCoupon = (row) => ({
  id: row.id,
  code: row.code,
  amount: Number(row.amount || 0),
  status: row.status || 'active',
  expiresAt: row.expires_at || row.expiresAt || '',
  usedAt: row.used_at || row.usedAt || '',
  usedOrderId: row.used_order_id || row.usedOrderId || '',
  createdAt: row.created_at || row.createdAt || '',
});

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
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return normalizeUser(data);
    }

    await delay(180);
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

const getSuccessfulReferralCount = async (supabase, userId) => {
  const { count, error } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_user_id', userId)
    .eq('status', 'active_plan');

  if (error) {
    throw createError(error, 'Unable to load referral progress.');
  }

  return count || 0;
};

const getReferralEntries = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('id, referral_code, referred_user_id, status, reward_type, reward_value, reward_coupon_id, created_at, updated_at')
    .eq('referrer_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw createError(error, 'Unable to load referral entries.');
  }

  return (data || []).map(normalizeReferralEntry);
};

const ensureAdmin = async (supabase, token) => {
  const authUser = await getCurrentUser(supabase, token);
  const profile = await getProfile(supabase, authUser.id);

  if (profile.role !== 'admin') {
    throw new Error('Admin access is required for this action.');
  }

  return profile;
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
    const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();

    if (error) {
      throw createError(error, 'Unable to load business settings.');
    }

    return normalizeSettings(data);
  },

  updateSettings: async (payload, token) => {
    const supabase = await getSupabaseForToken(token);
    const current = await direct.getSettings();
    const storefront = mergeStorefrontConfig(payload.storefront || current.storefront);
    const merged = {
      ...current,
      ...payload,
      whatsappNumber: normalizeWhatsappNumber(payload.whatsappNumber || current.whatsappNumber),
      phoneNumber: normalizePhoneDisplay(payload.phoneNumber || current.phoneNumber),
      deliveryRules: {
        ...(current.deliveryRules || {}),
        ...(payload.deliveryRules || {}),
      },
      offers: payload.offers || current.offers,
      trustPoints: payload.trustPoints || current.trustPoints,
      storefront,
    };

    const { data, error } = await supabase
      .from('app_settings')
      .update({
        business_name: merged.businessName,
        tagline: merged.tagline,
        whatsapp_number: normalizeWhatsappNumber(merged.whatsappNumber),
        phone_number: normalizePhoneDisplay(merged.phoneNumber),
        timings: merged.timings,
        maps_embed_url: merged.mapsEmbedUrl || '',
        trust_points: merged.trustPoints || [],
        delivery_rules: {
          ...(merged.deliveryRules || {}),
          storefront: merged.storefront,
        },
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

    let products = data.map(normalizeProduct).filter((product) => !isMonthlySubscriptionProduct(product));

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

    const product = normalizeProduct(data);

    if (isMonthlySubscriptionProduct(product)) {
      throw new Error('This plan is now available from the Monthly Plan section.');
    }

    return product;
  },

  createProduct: async (payload, token) => {
    const supabase = await getSupabaseForToken(token);
    const category = await getCategoryRecord(supabase, payload.category);
    const { data, error } = await supabase
      .from('products')
      .insert({
        category_id: category.id,
        name: payload.name,
        slug: createSlug(payload.name),
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

  updateProduct: async (id, payload, token) => {
    const supabase = await getSupabaseForToken(token);
    const update = {};

    if (payload.name !== undefined) {
      update.name = payload.name;
      update.slug = createSlug(payload.name);
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

  deleteProduct: async (id, token) => {
    const supabase = await getSupabaseForToken(token);
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

  createCategory: async (payload, token) => {
    const supabase = await getSupabaseForToken(token);
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: payload.name,
        slug: createSlug(payload.name),
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

  updateCategory: async (id, payload, token) => {
    const supabase = await getSupabaseForToken(token);
    const update = {};

    if (payload.name !== undefined) {
      update.name = payload.name;
      update.slug = createSlug(payload.name);
    }

    if (payload.description !== undefined) {
      update.description = payload.description;
    }

    if (payload.isActive !== undefined) {
      update.is_active = Boolean(payload.isActive);
    }

    const { data, error } = await supabase
      .from('categories')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw createError(error, 'Unable to update the category.');
    }

    return normalizeCategory(data);
  },

  deleteCategory: async (id, token) => {
    const supabase = await getSupabaseForToken(token);
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      throw createError(countError, 'Unable to verify linked menu items.');
    }

    if (count) {
      throw new Error('Move or delete linked products before removing this category.');
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      throw createError(error, 'Unable to delete the category.');
    }

    return null;
  },

  login: async (payload) => {
    const supabase = getTransientSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(payload.email),
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

  requestLoginOtp: async ({ email }) => {
    const supabase = getTransientSupabase();
    const normalizedEmail = normalizeEmail(email);
    const cachedResponse = buildStoredOtpResponse('login', normalizedEmail, 'login code');

    if (cachedResponse) {
      return cachedResponse;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw createOtpRequestError(error, 'Unable to send the login verification code.');
    }

    return buildFreshOtpResponse(
      'login',
      normalizedEmail,
      `Verification code sent to ${normalizedEmail}. It expires in 5 minutes.`,
    );
  },

  verifyLoginOtp: async ({ email, otp }) => {
    const supabase = getTransientSupabase();
    const normalizedEmail = normalizeEmail(email);
    const { error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: String(otp || '').trim(),
      type: 'email',
    });

    if (error) {
      throw createError(error, 'Invalid or expired login verification code.');
    }

    clearOtpRequest('login', normalizedEmail);

    return {
      verified: true,
      verifiedAt: new Date().toISOString(),
    };
  },

  requestRegistrationOtp: async (payload) => {
    const supabase = getTransientSupabase();
    const email = normalizeEmail(payload.email);
    const cachedResponse = buildStoredOtpResponse('registration', email, 'verification code');

    if (cachedResponse) {
      return cachedResponse;
    }

    const signUpResponse = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          name: payload.name.trim(),
          phoneNumber: payload.phoneNumber.trim(),
          role: 'customer',
        },
      },
    });

    if (isDuplicateAuthResponse(signUpResponse)) {
      const resendResponse = await supabase.auth.resend({
        email,
        type: 'signup',
      });

      if (resendResponse.error) {
        throw createOtpRequestError(
          resendResponse.error,
          'An account with this email already exists. Please log in instead.',
        );
      }

      return buildFreshOtpResponse(
        'registration',
        email,
        `Verification code sent to ${email}. It expires in 5 minutes.`,
      );
    }

    if (signUpResponse.error || !signUpResponse.data.user) {
      throw createOtpRequestError(signUpResponse.error, 'Unable to create the account.');
    }

    return buildFreshOtpResponse(
      'registration',
      email,
      `Verification code sent to ${email}. It expires in 5 minutes.`,
    );
  },

  resendRegistrationOtp: async ({ email }) => {
    const supabase = getTransientSupabase();
    const normalizedEmail = normalizeEmail(email);
    const cachedResponse = buildStoredOtpResponse('registration', normalizedEmail, 'verification code');

    if (cachedResponse) {
      return cachedResponse;
    }

    const { error } = await supabase.auth.resend({
      email: normalizedEmail,
      type: 'signup',
    });

    if (error) {
      throw createOtpRequestError(error, 'Unable to send a fresh verification code.');
    }

    return buildFreshOtpResponse(
      'registration',
      normalizedEmail,
      `A fresh verification code was sent to ${normalizedEmail}. It expires in 5 minutes.`,
    );
  },

  verifyRegistrationOtp: async (payload) => {
    const supabase = getTransientSupabase();
    const email = normalizeEmail(payload.email);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: String(payload.otp || '').trim(),
      type: 'email',
    });

    if (error) {
      throw createError(error, 'Invalid or expired verification code.');
    }

    clearOtpRequest('registration', email);

    const response = await direct.login({
      email,
      password: payload.password,
    });

    if (payload.referralCode?.trim()) {
      try {
        await direct.applyReferral(payload.referralCode.trim(), response.token);
        const mainSupabase = await getSupabaseForToken(response.token);
        response.user = await getProfile(mainSupabase, response.user.id);
      } catch {
        // Keep registration successful even if the referral code is invalid or already used.
      }
    }

    return response;
  },

  register: async (payload) => {
    const supabase = await getSupabase();
    const registerResponse = await supabase.auth.signUp({
      email: normalizeEmail(payload.email),
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          phoneNumber: payload.phoneNumber,
          role: 'customer',
        },
      },
    });

    if (isDuplicateAuthResponse(registerResponse)) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }

    if (registerResponse.error || !registerResponse.data.user) {
      throw createError(registerResponse.error, 'Unable to create the account.');
    }

    let session = registerResponse.data.session;

    if (!session) {
      const loginResponse = await supabase.auth.signInWithPassword({
        email: normalizeEmail(payload.email),
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

  createDeliveryPartner: async (payload, token) => {
    const supabase = await getSupabaseForToken(token);
    await ensureAdmin(supabase, token);

    const transientSupabase = getTransientSupabase();
    const email = normalizeEmail(payload.email);
    const signUpResponse = await transientSupabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          name: payload.name.trim(),
          phoneNumber: payload.phoneNumber.trim(),
          role: 'delivery',
        },
      },
    });

    if (isDuplicateAuthResponse(signUpResponse)) {
      throw new Error('A delivery partner with this email already exists.');
    }

    if (signUpResponse.error || !signUpResponse.data.user) {
      throw createError(signUpResponse.error, 'Unable to create the delivery account.');
    }

    const createdUser = await waitForProfile(supabase, signUpResponse.data.user.id);

    return {
      user: createdUser,
      credentials: {
        email,
        password: payload.password,
      },
    };
  },

  me: async (token) => {
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const user = await getProfile(supabase, authUser.id);

    return { user };
  },

  updateAddresses: async (addresses, token) => {
    const supabase = await getSupabaseForToken(token);
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
    const supabase = await getSupabaseForToken(token);
    await getCurrentUser(supabase, token);

    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      throw createError(error, 'Unable to load users.');
    }

    return data.map(normalizeUser);
  },

  getOrders: async (token, search = '') => {
    const supabase = await getSupabaseForToken(token);
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

  getOrder: async (id, token) => {
    const supabase = await getSupabaseForToken(token);
    await getCurrentUser(supabase, token);
    return getOrderRecord(supabase, id);
  },

  placeOrder: async (payload, token) => {
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const user = await getProfile(supabase, authUser.id);

    if (!payload?.items?.length) {
      throw new Error('Add at least one item before placing the order.');
    }

    const addressSavePromise = saveAddressIfNew(supabase, user, payload.address).catch(() => null);
    const { data, error } = await supabase.rpc('place_order', {
      p_user_id: authUser.id,
      p_address: payload.address,
      p_payment_method: payload.paymentMethod || 'COD',
      p_items: payload.items,
      p_note: payload.note || '',
      p_coupon_code: payload.couponCode || null,
      p_distance_km:
        payload.pricing?.distanceKm === null || payload.pricing?.distanceKm === undefined
          ? null
          : Number(payload.pricing.distanceKm),
    });

    if (error || !data?.id) {
      throw createError(error, 'Unable to place the order.');
    }

    const order = await getOrderRecord(supabase, data.id);
    await addressSavePromise;
    return order;
  },

  getMySubscription: async (token) => {
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const { data, error } = await supabase.rpc('get_my_subscription', {
      p_user_id: authUser.id,
    });

    if (error) {
      throw createError(error, 'Unable to load your monthly plan.');
    }

    return normalizeSubscription(data);
  },

  subscribeToMonthlyPlan: async (token) => {
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const { data, error } = await supabase.rpc('subscribe_monthly_plan', {
      p_user_id: authUser.id,
    });

    if (error) {
      throw createError(error, 'Unable to activate your monthly plan.');
    }

    return normalizeSubscription(data);
  },

  getRewardCoupons: async (token) => {
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const { data, error } = await supabase
      .from('reward_coupons')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw createError(error, 'Unable to load your reward coupons.');
    }

    return (data || []).map(normalizeRewardCoupon);
  },

  updateOrderStatus: async (id, payload, token) => {
    const supabase = await getSupabaseForToken(token);
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
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const [user, successfulReferralCount, referralEntries] = await Promise.all([
      getProfile(supabase, authUser.id),
      getSuccessfulReferralCount(supabase, authUser.id),
      getReferralEntries(supabase, authUser.id),
    ]);

    return buildReferralProgress(user, successfulReferralCount, referralEntries);
  },

  applyReferral: async (referralCode, token) => {
    const supabase = await getSupabaseForToken(token);
    const authUser = await getCurrentUser(supabase, token);
    const { error } = await supabase.rpc('apply_referral_code', {
      p_user_id: authUser.id,
      p_referral_code: referralCode.trim(),
    });

    if (error) {
      throw createError(error, 'Unable to apply the referral code.');
    }

    const user = await getProfile(supabase, authUser.id);
    const [successfulReferralCount, referralEntries] = await Promise.all([
      getSuccessfulReferralCount(supabase, authUser.id),
      getReferralEntries(supabase, authUser.id),
    ]);

    return buildReferralProgress(user, successfulReferralCount, referralEntries);
  },

  uploadImage: async (file, token) => {
    const supabase = await getSupabaseForToken(token);
    await getCurrentUser(supabase, token);

    if (!file) {
      throw new Error('Select an image before uploading.');
    }

    const extension = file.name?.split('.').pop() || 'jpg';
    const fileName = `products/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file, {
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

  requestOrderOtp: async ({ email }) => {
    const supabase = getTransientSupabase();
    const normalizedEmail = normalizeEmail(email);
    const cachedResponse = buildStoredOtpResponse('order', normalizedEmail, 'OTP');

    if (cachedResponse) {
      return cachedResponse;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw createOtpRequestError(error, 'Unable to send the order confirmation code.');
    }

    return buildFreshOtpResponse(
      'order',
      normalizedEmail,
      `Verification code sent to ${normalizedEmail}. It expires in 5 minutes.`,
    );
  },

  verifyOrderOtp: async ({ email, otp }) => {
    const supabase = getTransientSupabase();
    const normalizedEmail = normalizeEmail(email);
    const { error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: String(otp || '').trim(),
      type: 'email',
    });

    if (error) {
      throw createError(error, 'Invalid or expired order confirmation code.');
    }

    clearOtpRequest('order', normalizedEmail);

    return {
      verified: true,
      verifiedAt: new Date().toISOString(),
    };
  },

  updateDeliveryLocation: async (payload, token) => {
    const supabase = await getSupabaseForToken(token);
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

  createRazorpayOrder: async (payload, token) =>
    requestAppRoute('/api/razorpay/create-order', {
      method: 'POST',
      body: payload,
      token,
    }),

  verifyRazorpayPayment: async (payload, token) =>
    requestAppRoute('/api/razorpay/verify-payment', {
      method: 'POST',
      body: payload,
      token,
    }),
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
    USE_API_SERVER
      ? request(`/products/${id}`, { method: 'DELETE', token })
      : direct.deleteProduct(id, token),
  getCategories: () => (USE_API_SERVER ? request('/categories') : direct.getCategories()),
  createCategory: (payload, token) =>
    USE_API_SERVER
      ? request('/categories', { method: 'POST', body: payload, token })
      : direct.createCategory(payload, token),
  updateCategory: (id, payload, token) => direct.updateCategory(id, payload, token),
  deleteCategory: (id, token) => direct.deleteCategory(id, token),
  login: (payload) =>
    USE_API_SERVER ? request('/auth/login', { method: 'POST', body: payload }) : direct.login(payload),
  requestLoginOtp: (payload) => direct.requestLoginOtp(payload),
  verifyLoginOtp: (payload) => direct.verifyLoginOtp(payload),
  register: (payload) =>
    USE_API_SERVER ? request('/auth/register', { method: 'POST', body: payload }) : direct.register(payload),
  requestRegistrationOtp: (payload) => direct.requestRegistrationOtp(payload),
  resendRegistrationOtp: (payload) => direct.resendRegistrationOtp(payload),
  verifyRegistrationOtp: (payload) => direct.verifyRegistrationOtp(payload),
  createDeliveryPartner: (payload, token) => direct.createDeliveryPartner(payload, token),
  me: (token) => (USE_API_SERVER ? request('/auth/me', { token }) : direct.me(token)),
  getMySubscription: (token) => direct.getMySubscription(token),
  subscribeToMonthlyPlan: (token) => direct.subscribeToMonthlyPlan(token),
  getRewardCoupons: (token) => direct.getRewardCoupons(token),
  updateAddresses: (addresses, token) =>
    USE_API_SERVER
      ? request('/auth/addresses', { method: 'PUT', body: { addresses }, token })
      : direct.updateAddresses(addresses, token),
  getUsers: (role, token) =>
    USE_API_SERVER
      ? request(`/auth/users${role ? `?role=${role}` : ''}`, { token })
      : direct.getUsers(role, token),
  getOrders: (token, search = '') =>
    USE_API_SERVER
      ? request(`/orders${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token })
      : direct.getOrders(token, search),
  getOrder: (id, token) => direct.getOrder(id, token),
  placeOrder: (payload, token) =>
    USE_API_SERVER
      ? request('/orders', { method: 'POST', body: payload, token })
      : direct.placeOrder(payload, token),
  updateOrderStatus: (id, payload, token) =>
    USE_API_SERVER
      ? request(`/orders/${id}/status`, { method: 'PUT', body: payload, token })
      : direct.updateOrderStatus(id, payload, token),
  getTracking: (orderId) =>
    USE_API_SERVER ? request(`/tracking/${orderId}`) : direct.getTracking(orderId),
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
  requestOrderOtp: (payload) => direct.requestOrderOtp(payload),
  verifyOrderOtp: (payload) => direct.verifyOrderOtp(payload),
  updateDeliveryLocation: (payload, token) =>
    USE_API_SERVER
      ? request('/delivery/location-update', { method: 'POST', body: payload, token })
      : direct.updateDeliveryLocation(payload, token),
  createRazorpayOrder: (payload, token) => direct.createRazorpayOrder(payload, token),
  verifyRazorpayPayment: (payload, token) => direct.verifyRazorpayPayment(payload, token),
};
