import { publicEnv } from '../lib/env';

const API_URL = publicEnv.apiUrl;

const request = async (path, options = {}) => {
  const { token, body, headers, method = 'GET', isForm = false } = options;
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

export const api = {
  getSettings: () => request('/settings'),
  updateSettings: (payload, token) => request('/settings', { method: 'PUT', body: payload, token }),
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/products${searchParams ? `?${searchParams}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload, token) => request('/products', { method: 'POST', body: payload, token }),
  updateProduct: (id, payload, token) => request(`/products/${id}`, { method: 'PUT', body: payload, token }),
  deleteProduct: (id, token) => request(`/products/${id}`, { method: 'DELETE', token }),
  getCategories: () => request('/categories'),
  createCategory: (payload, token) => request('/categories', { method: 'POST', body: payload, token }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  updateAddresses: (addresses, token) =>
    request('/auth/addresses', { method: 'PUT', body: { addresses }, token }),
  getUsers: (role, token) => request(`/auth/users${role ? `?role=${role}` : ''}`, { token }),
  getOrders: (token, search = '') => request(`/orders${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token }),
  placeOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  updateOrderStatus: (id, payload, token) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: payload, token }),
  getTracking: (orderId) => request(`/tracking/${orderId}`),
  getReferralProgress: (token) => request('/referral/me', { token }),
  applyReferral: (referralCode, token) =>
    request('/referral/apply', { method: 'POST', body: { referralCode }, token }),
  uploadImage: (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/upload/image', { method: 'POST', body: formData, token, isForm: true });
  },
  updateDeliveryLocation: (payload, token) =>
    request('/delivery/location-update', { method: 'POST', body: payload, token }),
};
