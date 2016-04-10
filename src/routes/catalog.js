'use strict';

const models = require('../models');

module.exports.getCategories = function _getCategories(request, reply) {
	models.Category.find(reply);
};

module.exports.getCategoryDetail = function _getCategoryDetail(request, reply) {
	models.Category.findOne({id: request.params.categoryId}, reply);
};

module.exports.getFeaturedProducts = function _getFeaturedProducts(request, reply) {
	console.log('Routes::Catalog::getFeaturedProducts# TODO');
	reply([]);
};

module.exports.getCategoryProducts = function _getCategoryProducts(request, reply) {
	models.Product.find({categoryId: request.params.categoryId}, reply);
};

module.exports.getProductDetail = function _getProductDetail(request, reply) {
	models.Product.findOne({id: request.params.productId}, reply);
};
