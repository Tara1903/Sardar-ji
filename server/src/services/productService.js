const { dataStore } = require('./dataStore');
const { getFallbackImageByCategory } = require('../utils/fallbackImages');

const normalizeProduct = (payload) => ({
  ...payload,
  image: payload.image || getFallbackImageByCategory(payload.category),
});

module.exports = {
  createProduct: async (payload) => dataStore.createProduct(normalizeProduct(payload)),
  deleteProduct: async (id) => dataStore.deleteProduct(id),
  getProductById: async (id) => dataStore.getProductById(id),
  getProducts: async (filters = {}) => dataStore.getProducts(filters),
  updateProduct: async (id, payload) => dataStore.updateProduct(id, normalizeProduct(payload)),
};
