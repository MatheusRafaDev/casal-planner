const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5286',
      changeOrigin: true,
      onProxyRes: function(proxyRes) {
        if (proxyRes.headers['set-cookie']) {
          proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie =>
            cookie
              .replace(/; secure/gi, '')
              .replace(/; samesite=strict/gi, '; SameSite=Lax')
              .replace(/; samesite=none/gi, '; SameSite=Lax')
          );
        }
      }
    })
  );
};