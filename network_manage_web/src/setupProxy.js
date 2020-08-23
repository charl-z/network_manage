const proxy = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(proxy('/api/', {
    target: 'http://10.2.0.41:8000/',
    secure: false,
    changeOrigin: true,
    ws: true,
    headers: {'X-Real-IP': '127.0.0.1'},
    pathRewrite: {
      '^/api': ''
    }
  }))
};
