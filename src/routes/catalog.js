'use strict';

const async = require('async'),
	Boom = require('boom'),
	models = require('../models');

const FEATURED_PRODUCTS_COUNT = 8;

function _getRandomNumber(min, max) {
	return Math.random() * (max - min) + min;
}

module.exports.getCategories = function getCategories(request, reply) {
	models.Category.find().lean().exec(reply);
};

module.exports.getCategoryDetail = function getCategoryDetail(request, reply) {
	models.Category.findOne({id: request.params.categoryId}, (err, category) => {
		if (category) {
			reply(null, category);
		} else {
			reply(err || Boom.notFound('Category not found'));
		}
	});
};

module.exports.getFeaturedProducts = function getFeaturedProducts(request, reply) {
	async.waterfall([
		(next) => {
			models.Product.count(next);
		},
		(count, next) => {
			const index = Math.max(0, _getRandomNumber(0, count - FEATURED_PRODUCTS_COUNT - 1)),
				query = models.Product.find().skip(index).limit(FEATURED_PRODUCTS_COUNT).lean();
			query.exec(next);
		}
	], reply);
};

module.exports.getCategoryProducts = function getCategoryProducts(request, reply) {
	models.Product.find({categoryId: request.params.categoryId}).lean().exec(reply);
};

module.exports.getProductDetail = function getProductDetail(request, reply) {
	models.Product.findOne({id: request.params.productId}).lean().exec((err, product) => {
		if (product) {
			reply(null, product);
		} else {
			reply(err || Boom.notFound('Product not found'));
		}
	});
};
