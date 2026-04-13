// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Pega a URL da API da variável de ambiente ou usa o padrão
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5286';
  
  console.log(`🔧 Configurando proxy para: ${apiUrl}`)
  ;
  // Extrai o host e a porta da URL
  const targetUrl = apiUrl.replace('/api', '');
  
  console.log(`🔧 Proxy configurado para: ${targetUrl}`);

  app.use(
    '/api',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      onProxyRes: function(proxyRes, req, res) {
        // Modifica os cookies para SameSite=Lax
        if (proxyRes.headers['set-cookie']) {
          proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie =>
            cookie
              .replace(/; secure/gi, '')
              .replace(/; samesite=strict/gi, '; SameSite=Lax')
              .replace(/; samesite=none/gi, '; SameSite=Lax')
          );
        }
      },
      onError: function(err, req, res) {
        console.error(`❌ Erro no proxy: ${err.message}`);
        res.status(500).send('Proxy Error');
      }
    })
  );
};