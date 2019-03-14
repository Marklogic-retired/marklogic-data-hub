'use strict';

const fs = require('fs'),
    path = require('path'),
    http = require('http');

const proxy = require('http-proxy-middleware')
const app = require('connect')();
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const serverPort = 8081;

// swaggerRouter configuration
const options = {
  swaggerUi: path.join(__dirname, '../swagger/mocks.json'),
  controllers: path.join(__dirname, './controllers'),
  ignoreMissingHandlers: true, // passes calls not mocked in JSON
  useStubs: false // Conditionally turn on stubs (mock mode)
};
// swaggerUI configuration
const uiOptions = {
  apiDocs: '/api/swagger/doc/',
  swaggerUi: '/api/swagger-ui/'
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
let spec = fs.readFileSync(path.join(__dirname,'../swagger/mocks.yaml'), 'utf8');
let swaggerDoc = jsyaml.safeLoad(spec);
let swaggerJSONDoc = require('../swagger/mocks.json');

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi(uiOptions));

  // proxy all remaining calls to 8080
  app.use(proxy({ 
    target: 'http://localhost:8080', 
    ws: true, // proxy websockets
  }))

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Sample Mock API server is now running at http://localhost:8081');
    console.log('Swagger JSON Doc: http://localhost:4200/api/swagger/doc/');
    console.log('Swagger UI: http://localhost:4200/api/swagger-ui/');
  });

});
