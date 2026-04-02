const { app } = require('./app');
const { env } = require('./config/env');
const { dataStore } = require('./services/dataStore');

const startServer = async () => {
  await dataStore.init();
  app.listen(env.port);
};

startServer().catch((error) => {
  process.stderr.write(`Failed to start server: ${error.message}\n`);
  process.exit(1);
});
