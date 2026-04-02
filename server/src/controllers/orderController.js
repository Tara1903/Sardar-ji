const { asyncHandler } = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');
const { dataStore } = require('../services/dataStore');
const { orderCreateSchema, orderStatusSchema } = require('../utils/validators');

module.exports = {
  createOrder: asyncHandler(async (req, res) => {
    const payload = orderCreateSchema.parse(req.body);
    const order = await orderService.createOrder({
      user: req.user,
      ...payload,
    });
    res.status(201).json(order);
  }),

  getOrders: asyncHandler(async (req, res) => {
    const orders = await orderService.getOrders();
    const filtered = req.user.role === 'customer'
      ? orders.filter((order) => order.userId === req.user.id)
      : req.user.role === 'delivery'
        ? orders.filter((order) => order.assignedDeliveryBoyId === req.user.id)
        : orders;

    if (req.query.status) {
      return res.json(filtered.filter((order) => order.status === req.query.status));
    }

    if (req.query.search) {
      const query = req.query.search.toLowerCase();
      return res.json(
        filtered.filter((order) =>
          `${order.orderNumber} ${order.customerName}`.toLowerCase().includes(query),
        ),
      );
    }

    res.json(filtered);
  }),

  updateOrderStatus: asyncHandler(async (req, res) => {
    const payload = orderStatusSchema.parse(req.body);
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (req.user.role === 'delivery' && order.assignedDeliveryBoyId !== req.user.id) {
      return res.status(403).json({ message: 'This order is not assigned to you.' });
    }

    let assignedDeliveryBoyId = payload.assignedDeliveryBoyId || '';
    if (assignedDeliveryBoyId) {
      const deliveryBoy = await dataStore.getUserById(assignedDeliveryBoyId);
      if (!deliveryBoy || deliveryBoy.role !== 'delivery') {
        return res.status(400).json({ message: 'Assigned delivery partner was not found.' });
      }
    }

    if (req.user.role === 'delivery') {
      assignedDeliveryBoyId = order.assignedDeliveryBoyId || req.user.id;
    }

    const updated = await orderService.updateOrderStatus(req.params.id, {
      status: payload.status,
      assignedDeliveryBoyId,
      actorUserId: req.user.id,
    });
    res.json(updated);
  }),
};
