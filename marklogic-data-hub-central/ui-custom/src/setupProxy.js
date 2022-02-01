const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
    app.use(
        "/api/explore/twizzlers/login",
        createProxyMiddleware({
            target: "http://localhost:8888",
            changeOrigin: true
        })
    );
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://localhost:8080",
            changeOrigin: true
        })
    );
};
