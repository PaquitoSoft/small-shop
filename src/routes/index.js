'use strict';

const staticContentHandlers = require('./static-content'),
	catalogHandlers = require('./catalog');


module.exports.configureRoutes = function _configureRoutes(server) {

	/* STATIC CONTENT */
	server.route({
		method: 'GET',
		path: '/static/{assetPath*}',
		handler: staticContentHandlers.getAsset
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

};
