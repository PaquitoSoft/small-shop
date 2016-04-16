'use strict';

const catalogHandlers = require('./catalog'),
	shopCartHandlers = require('./shop-cart');


module.exports.configureRoutes = function _configureRoutes(server) {

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
		method: 'DELETE',
		path: '/shop-cart/product/{productId}',
		handler: shopCartHandlers.removeProductFromCart
	});

};
