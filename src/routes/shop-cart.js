'use strict';

const async = require('async'),
	uuid = require('uuid'),
	Boom = require('boom'),
	models = require('../models');

const SHOP_CART_COOKIE_NAME = 'shop-cart';

function _getShopCart(request) {
	return request.yar.get(SHOP_CART_COOKIE_NAME) || {id: uuid.v4(), orderItems: []};
}

function _saveShopCart(request, shopCart) {
	request.yar.set(SHOP_CART_COOKIE_NAME, shopCart);
	return shopCart;
}

module.exports.getShopCart = function getShopCart(request, reply) {
	reply(_getShopCart(request));
};

module.exports.addProductToCart = function addProductToCart(request, reply) {
	let shopCart = _getShopCart(request),
		orderItem = shopCart.orderItems.find(orderItem => orderItem.productId === request.payload.productId);

	if (orderItem) {
		orderItem.quantity++;
	} else {
		request.payload.id = uuid.v4();
		shopCart.orderItems.push(request.payload);
	}

	_saveShopCart(request, shopCart);

	reply(shopCart);
};

module.exports.removeProductFromCart = function removeProductFromCart(request, reply) {
	let shopCart = _getShopCart(request),
		orderItemIndex = shopCart.orderItems.findIndex(orderItem => orderItem.productId === request.params.productId);

	if (orderItemIndex !== -1) {
		shopCart.orderItems.splice(orderItemIndex, 1);
		_saveShopCart(request, shopCart);
		reply(shopCart);
	} else {
		reply(Boom.notFound('Order Item not found is shop cart'));
	}
};
