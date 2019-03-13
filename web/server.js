'use strict';
/**************************************************************************************************
 * This sample demonstrates a few more advanced features of Swagger-Express-Middleware,
 * such as setting a few options, initializing the mock data store, and adding custom middleware logic.
 **************************************************************************************************/

const util = require('util');
const path = require('path');
const proxy = require('http-proxy-middleware')
const express = require('express');
const request = require('request');
const swagger = require('swagger-express-middleware');
const Middleware = swagger.Middleware;
const MemoryDataStore = swagger.MemoryDataStore;
const Resource = swagger.Resource;
const Collection = swagger.Collection;
const swaggerUi = require('swagger-ui-express');
const swaggerMockDocPath = path.join(__dirname, '/api/swagger/mocks.json');
const swaggerMockDocument = require(swaggerMockDocPath);
// const swaggerFullDocPath = path.join(__dirname, '/api/swagger/full.json')
// const swaggerFullDocument = require(swaggerFullDocPath);

// turn off warnings
process.env.WARN = 'off';
 
let app = express();
let middleware = new Middleware(app);

// Initialize Swagger Express Middleware with our Swagger file
middleware.init(swaggerMockDocPath, (err) => {

  // Create a custom data store with some initial mock data
  // Not currently functioning as expected
  // let myDB = new MemoryDataStore();
  // let data = [
  //   {collection: '/api/samples', name: '/1', data: {id: 1, name: 'aaa', status: 'old'}},
  //   {collection: '/api/samples', name: '/2', data: {id: 2, name: 'bbb', status: 'something'}},
  //   {collection: '/api/samples', name: '/3', data: {id: 3, name: 'ccc', status: 'geewiz'}},
  //   {collection: '/api/samples', name: '/4', data: {id: 4, name: 'ddd', status: 'ohhhh'}},
  //   {collection: '/api/samples', name: '/5', data: {id: 5, name: 'eee', status: 'wowowow'}}
  // ];
  // myDB.save(Resource.parse(data));

  // Enable Express' case-sensitive and strict options
  app.enable('case sensitive routing');
  app.enable('strict routing');

  app.use(middleware.metadata());

  // http://localhost:4200/api/swagger/doc/ - see Swagger document
  app.use(middleware.files(
    {
      apiPath: '/api/swagger/doc/',
      rawFilesPath: false
    }
  ));

  // http://localhost:4200/api/swagger-ui/ - see Swagger UI
  app.use('/api/swagger-ui/', swaggerUi.serve, swaggerUi.setup(swaggerMockDocument));

  // can only serve one Swagger UI, so below code won't work:  https://github.com/swagger-api/swagger-ui/issues/1672
  // http://localhost:4200/api/swagger/ui/full/ - see Swagger UI
  // app.use('/api/swagger/ui/full/', swaggerUi.serve, swaggerUi.setup(swaggerFullDocument));

  app.use(
    middleware.CORS(),
    // middleware.validateRequest()  // TODO: requires very thorough Swagger documentation to be in place
  );
  
  // // The mock middleware will use our custom data store,
  // // which we already pre-populated with mock data
  // app.use(middleware.mock(myDB));

  // standard mock use - swagger definitions only
  app.use(middleware.mock());

  app.use(proxy({ 
    target: 'http://localhost:8080', 
    ws: true, // proxy websockets
  }))

  app.listen(8081, () => {
    console.log('Sample Mock API server is now running at http://localhost:8081');
    console.log('Swagger JSON Doc: http://localhost:4200/api/swagger/doc/');
    console.log('Swagger UI: http://localhost:4200/api/swagger-ui/');
  });
});