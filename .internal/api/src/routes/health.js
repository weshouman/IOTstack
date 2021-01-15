const registerHealthRoutes = ({ server, settings, version, logger } = {}) => {
  const HealthView = require('../views/health');

  const healthView = HealthView({ server, settings, version, logger });

  healthView.init();

  server.post('/health', (req, res, next) => {
    healthView.health(req, res, next);
  });

  server.post('/ping', (req, res, next) => {
    healthView.health(req, res, next);
  });

  server.get('/health', (req, res, next) => {
    healthView.health(req, res, next);
  });

  server.get('/ping', (req, res, next) => {
    healthView.health(req, res, next);
  });
};

module.exports = registerHealthRoutes;