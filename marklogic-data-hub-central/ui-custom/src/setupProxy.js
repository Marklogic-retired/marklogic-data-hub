const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require('request');

module.exports = function(app) {
    app.get('/api/explore/login', (req, res) => {
        // For dynamic proxying, get URI from header
        const { headers } = req;
        const uri = headers['x-forward'];
        delete headers['x-forward'];
        delete headers.host;
        try {
          request({uri, headers})
          .on('error', (error) => {
            res.status(503).send(error.message)
          })
          .pipe(res);
        } catch (error) {
          res.status(400).send(error.message);
        }
      });
    app.use("/api", createProxyMiddleware({
            target: "http://localhost:8080",
            changeOrigin: true
        })
    );
};
