const { dataStore } = require('./dataStore');

const createOrder = async ({ user, items, address, paymentMethod, note }) => {
  const order = await dataStore.createOrder({
    userId: user.id,
    items,
    address,
    paymentMethod,
    note,
  });

  const latestUser = await dataStore.getUserById(user.id);
  const existingAddress = (latestUser.addresses || []).find(
    (savedAddress) =>
      savedAddress.fullAddress === address.fullAddress &&
      savedAddress.phoneNumber === address.phoneNumber &&
      savedAddress.pincode === address.pincode,
  );

  if (!existingAddress) {
    await dataStore.updateUser(user.id, {
      addresses: [
        ...(latestUser.addresses || []),
        {
          id: `address-${Date.now()}`,
          ...address,
        },
      ],
    });
  }

  return order;
};

module.exports = {
  createOrder,
  getOrderById: async (id) => dataStore.getOrderById(id),
  getOrders: async () => dataStore.getOrders(),
  trackDelivery: async (orderId, payload) => dataStore.trackDelivery(orderId, payload),
  updateOrderStatus: async (id, payload) => dataStore.updateOrderStatus(id, payload),
};
