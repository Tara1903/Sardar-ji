const { dataStore } = require('./dataStore');

module.exports = {
  getSettings: async () => dataStore.getSettings(),
  updateSettings: async (payload) => dataStore.updateSettings(payload),
};
