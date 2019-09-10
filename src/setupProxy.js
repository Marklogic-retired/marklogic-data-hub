const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/datahub', { target: 'http://localhost:8080' }));
  app.use(proxy('/v1', { target: 'http://localhost:8011' }));
};