const { asyncHandler } = require('../middleware/asyncHandler');
const { dataStore } = require('../services/dataStore');
const { categorySchema } = require('../utils/validators');

module.exports = {
  createCategory: asyncHandler(async (req, res) => {
    const category = await dataStore.createCategory(categorySchema.parse(req.body));
    res.status(201).json(category);
  }),

  getCategories: asyncHandler(async (_req, res) => {
    const categories = await dataStore.list('categories');
    res.json(categories);
  }),
};
