const { asyncHandler } = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');
const { deliveryLocationSchema } = require('../utils/validators');

module.exports = {
  updateLocation: asyncHandler(async (req, res) => {
    const payload = deliveryLocationSchema.parse(req.body);
    const order = await orderService.getOrderById(payload.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.assignedDeliveryBoyId !== req.user.id) {
      return res.status(403).json({ message: 'This order is not assigned to you.' });
    }

    const updated = await orderService.trackDelivery(payload.orderId, {
      deliveryUserId: req.user.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
    });

    res.json(updated);
  }),
};
