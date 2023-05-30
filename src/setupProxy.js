const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = {
  target: 'https://meet.talkplayground.com',
  changeOrigin: true
};

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://meet.talkplayground.com',
      changeOrigin: true
    })
  );
};
