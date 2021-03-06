'use strict';

const catalogHandlers = require('./catalog'),
	shopCartHandlers = require('./shop-cart'),
	appInfo = require('../../package.json');


module.exports.configureRoutes = function _configureRoutes(server) {

	server.route({
		method: 'GET',
		path: '/version',
		handler: (request, reply) => { reply({version:appInfo.version}); }
	});

	/* STATIC CONTENT */
	server.route({
		method: 'GET',
		path: '/static/{assetPath*}',
		handler: {
			directory: {
				path: 'data'
			}
		}
	});

	/* CATALOG ROUTES */
	server.route({
		method: 'GET',
		path: '/catalog/category',
		handler: catalogHandlers.getCategories
	});

	server.route({
		method: 'GET',
		path: '/catalog/category/{categoryId}',
		handler: catalogHandlers.getCategoryDetail
	});

	server.route({
		method: 'GET',
		path: '/catalog/category/{categoryId}/products',
		handler: catalogHandlers.getCategoryProducts
	});

	server.route({
		method: 'GET',
		path: '/catalog/product/{productId}',
		handler: catalogHandlers.getProductDetail
	});

	server.route({
		method: 'GET',
		path: '/catalog/featured-products',
		handler: catalogHandlers.getFeaturedProducts
	});



	/* SHOP ROUTES */
	server.route({
		method: 'GET',
		path: '/shop-cart',
		handler: shopCartHandlers.getShopCart
	});

	server.route({
		method: 'POST',
		path: '/shop-cart/product',
		handler: shopCartHandlers.addProductToCart
	});

	server.route({
		method: 'PUT',
		path: '/shop-cart/order-item',
		handler: shopCartHandlers.updateOrderItemInCart
	});

	server.route({
		method: 'DELETE',
		path: '/shop-cart/order-item/{orderItemId}',
		handler: shopCartHandlers.removeOrderItemFromCart
	});

	server.route({
		method: 'POST',
		path: '/shop-cart/checkout',
		handler: shopCartHandlers.orderCheckout
	});

	server.route({
		method: 'GET',
		path: '/shop-cart/order-detail/{orderId}',
		handler: shopCartHandlers.getOrderDetail
	});

};
