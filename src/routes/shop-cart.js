'use strict';

const async = require('async'),
	uuid = require('uuid'),
	Boom = require('boom'),
	models = require('../models');

const SHOP_CART_COOKIE_NAME = 'shop-cart';

function _getShopCart(request) {
	return request.yar.get(SHOP_CART_COOKIE_NAME) || {orderId: uuid.v4(), orderItems: []};
}

function _saveShopCart(request, shopCart) {
	request.yar.set(SHOP_CART_COOKIE_NAME, shopCart);
	return shopCart;
}

function _updateShopCart(request, reply, orderItemId, handleShopCart) {
	let shopCart = _getShopCart(request),
		orderItemIndex = shopCart.orderItems.findIndex(orderItem => orderItem.id === orderItemId);

	if (orderItemIndex !== -1) {
		// shopCart.orderItems.splice(orderItemIndex, 1);
		shopCart = handleShopCart.call(null, shopCart, orderItemIndex);
		_saveShopCart(request, shopCart);
		reply(null, shopCart);
	} else {
		reply(Boom.notFound('Order Item not found in shop cart'));
	}	
}

module.exports.getShopCart = function getShopCart(request, reply) {
	reply(null, _getShopCart(request));
};

module.exports.addProductToCart = function addProductToCart(request, reply) {
	let shopCart = _getShopCart(request),
		orderItem = shopCart.orderItems.find(orderItem => {
			return orderItem.productId === request.payload.productId
				&& orderItem.colorId === request.payload.colorId
				&& orderItem.sizeId === request.payload.sizeId;
		});

	models.Product.findOne({id: request.payload.productId}, (err, data) => {
		if (err) {
			reply(err);
		} else if (!data) {
			reply(Boom.notFound('Product not found'));
		} else {
			if (orderItem) {
				orderItem.quantity += request.payload.quantity;
			} else {
				orderItem = request.payload;
				orderItem.id = uuid.v4();
				orderItem.detail = data;
				shopCart.orderItems.push(orderItem);
			}

			_saveShopCart(request, shopCart);
			reply(null, shopCart);
		}
	});
};

module.exports.updateOrderItemInCart = function updateOrderItemInCart(request, reply) {
	_updateShopCart(request, reply, request.payload.id, (shopCart, orderItemIndex) => {
		shopCart.orderItems[orderItemIndex].quantity = request.payload.quantity;
		return shopCart;
	});
};

module.exports.removeOrderItemFromCart = function removeOrderItemFromCart(request, reply) {
	_updateShopCart(request, reply, request.params.orderItemId, (shopCart, orderItemIndex) => {
		shopCart.orderItems.splice(orderItemIndex, 1);
		return shopCart;
	});
};
