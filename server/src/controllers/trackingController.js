const { asyncHandler } = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');

module.exports = {
  getTracking: asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(order);
  }),
};
