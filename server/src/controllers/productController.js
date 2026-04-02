const { asyncHandler } = require('../middleware/asyncHandler');
const productService = require('../services/productService');
const { productSchema } = require('../utils/validators');

module.exports = {
  createProduct: asyncHandler(async (req, res) => {
    const payload = productSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      isAvailable: req.body.isAvailable !== false && req.body.isAvailable !== 'false',
    });
    const product = await productService.createProduct(payload);
    res.status(201).json(product);
  }),

  deleteProduct: asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  }),

  getProductById: asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  }),

  getProducts: asyncHandler(async (req, res) => {
    const products = await productService.getProducts(req.query);
    res.json(products);
  }),

  updateProduct: asyncHandler(async (req, res) => {
    const payload = productSchema.partial().parse({
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
    });
    const product = await productService.updateProduct(req.params.id, payload);
    res.json(product);
  }),
};
