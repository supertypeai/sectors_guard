// CRA setupProxy.js — proxy only /api to FastAPI; everything else falls
// through to webpack-dev-server's history fallback so React Router handles it.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};
