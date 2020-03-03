const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/datahub', { target: 'http://localhost:8080' }));
};