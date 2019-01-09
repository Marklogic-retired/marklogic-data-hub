TODOs for Mock API
--------------------
1. Create sample Swagger JSON doc, defining NEW mocked endpoints


2. Setup custom middleware to passthrough API paths that already exist:  
  https://stackoverflow.com/questions/7559862/no-response-using-express-proxy-route/20539239#20539239

  app.use('/api', function(req, res) {
    var url = apiUrl + req.url;
    req.pipe(request({ qs:req.query, uri: url })).pipe(res);
    // req.pipe(request(url)).pipe(res);
  });


3.1 Assume any request that doesn't have a corresponding Swagger API defined, we are just forwarding on to the localhost:8080


4. Later implement a mock
  // Make sure the Mock middleware comes *after* your middleware
  app.use(middleware.mock());


5. Observe what comes back from mock that is powered by Swagger doc


https://github.com/APIDevTools/swagger-express-middleware/issues/57#issuecomment-221553207

responses.[code].schema.example
Spec: here
This object allows you to provide an example of a schema. Swagger Express Middleware will automatically use your example as the response if there is no other data available, as described here

responses.[code].schema.default
Spec: here
This object allows you to provide a default value for a schema. Swagger Express Middleware treats this exactly the same as the response.[code].schema.example property, so it will use it as the response if there is no other data available.


6. Add extensions / custom fields to swagger doc (if required) - https://swagger.io/docs/specification/2-0/swagger-extensions/:
  6.1 file name of mock data ?
  6.2 flag saying whether a path is live or not (passthrough vs mock response)

