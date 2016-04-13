'use strict';

const async = require('async');

const models = require('../models');

const FEATURED_PRODUCTS_COUNT = 8;

function _getRandomNumber(min, max) {
	return Math.random() * (max - min) + min;
}

module.exports.getCategories = function _getCategories(request, reply) {
	models.Category.find(reply);
};

module.exports.getCategoryDetail = function _getCategoryDetail(request, reply) {
	models.Category.findOne({id: request.params.categoryId}, reply);
};

module.exports.getFeaturedProducts = function _getFeaturedProducts(request, reply) {
	async.waterfall([
		(next) => {
			models.Product.count(next);
		},
		(count, next) => {
			const index = Math.max(0, _getRandomNumber(0, count - FEATURED_PRODUCTS_COUNT - 1)),
				query = models.Product.find().skip(index).limit(FEATURED_PRODUCTS_COUNT);
			query.exec(next);
		}
	], reply);
};

module.exports.getCategoryProducts = function _getCategoryProducts(request, reply) {
	models.Product.find({categoryId: request.params.categoryId}, reply);
};

module.exports.getProductDetail = function _getProductDetail(request, reply) {
	models.Product.findOne({id: request.params.productId}, reply);
};
