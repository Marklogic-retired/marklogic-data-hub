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

const app = express();
const middleware = new Middleware(app);

// TODO JsonRefs is able to resolve $ref values from the OpenAPI file to a JSON schema under specs/models, but it's not
// then able to resolve references between models.
JsonRefs
  .resolveRefsAt(path.join(__dirname, '../../../specs/reference/rest-endpoints/models.v1.json'))
  .then(function (res) {
    // Initialize Swagger Express Middleware with our Swagger file
    middleware.init(swaggerMockDocPath, (err) => {

      // Enable Express' case-sensitive and strict options
      app.enable('case sensitive routing');
      app.enable('strict routing');

      app.use(middleware.metadata());

      app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
      });

      // Found this technique at https://stackoverflow.com/questions/55273857/swagger-ui-express-multiple-routes-for-different-api-documentation
      app.use('/api/swagger-ui/', swaggerUi.serve, (...args) => swaggerUi.setup(swaggerMockDocument)(...args));
      app.use("/models/", swaggerUi.serve, (...args) => swaggerUi.setup(res.resolved)(...args));

      app.use(
        middleware.CORS()
      );

      // standard mock use - swagger definitions only
      app.use(middleware.mock());

      // Not working - throws TypeError: Converting circular structure to JSON
      // app.use(middleware.files({
      //   apiPath: '/api/swagger/doc/',
      //   rawFilesPath: false
      // }));

      app.use(proxy({
        target: 'http://localhost:8080',
        ws: true // proxy websockets
      }));

      app.listen(8081, () => {
        console.log('Swagger UI: http://localhost:8081/');
      });
    });

  });

