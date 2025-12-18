// // src/setupProxy.js
// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function (app) {
//     app.use(
//         '/api', // Ваши запросы будут начинаться с /api
//         createProxyMiddleware({
//             target: 'https://di.i-rs.ru', // Адрес сервера, на который проксируются запросы
//             changeOrigin: true, // Меняет заголовок Origin в запросе на целевой домен
//             secure: false, // Отключает проверку SSL-сертификата (полезно для разработки)
//             pathRewrite: {
//                 '^/api': '', // Убирает префикс /api при отправке запроса
//             },
//         })
//     );
// };