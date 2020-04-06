'use strict';
/**************************************************************************************************
 * This sample demonstrates a few more advanced features of Swagger-Express-Middleware,
 * such as setting a few options, initializing the mock data store, and adding custom middleware logic.
 **************************************************************************************************/

const path = require('path');
const proxy = require('http-proxy-middleware');
const express = require('express');
const JsonRefs = require('json-refs');
const swagger = require('swagger-express-middleware');
const Middleware = swagger.Middleware;
const swaggerUi = require('swagger-ui-express');
const swaggerMockDocPath = path.join(__dirname, '../api/swagger/mocks.json');
const swaggerMockDocument = require(swaggerMockDocPath);

// turn off warnings
process.env.WARN = 'off';

let app = express();
let middleware = new Middleware(app);

// Initialize Swagger Express Middleware with our Swagger file
middleware.init(swaggerMockDocPath, (err) => {

  // Enable Express' case-sensitive and strict options
  app.enable('case sensitive routing');
  app.enable('strict routing');

  app.use(middleware.metadata());

  // Not working - throws TypeError: Converting circular structure to JSON
  // app.use(middleware.files({
  //   apiPath: '/api/swagger/doc/',
  //   rawFilesPath: false
  // }));

  JsonRefs
    .resolveRefsAt(path.join(__dirname, 'specs/reference/rest-endpoints/merged-apis.json'))
    .then(function (res) {

      app.use('/api/swagger-ui/', swaggerUi.serve, swaggerUi.setup(res.resolved));

      app.use(
        middleware.CORS()
      );

      // standard mock use - swagger definitions only
      app.use(middleware.mock());

      app.use(proxy({
        target: 'http://localhost:8080',
        ws: true // proxy websockets
      }));

      app.listen(8081, () => {
        console.log('Sample Mock API server is now running at http://localhost:8081');
        console.log('Swagger UI: http://localhost:8081/api/swagger-ui/');
      });
    });

});
