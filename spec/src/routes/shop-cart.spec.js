'use strict';

const expect = require('chai').expect,
	async = require('async'),
	clone = require('clone'),
	database = require('../../../src/lib/db'),
	shopCartHandlers = require('../../../src/routes/shop-cart');

let SESSION = {};

function _createFakeRequest(payload, params) {
	return {
		yar: {
			get: (key) => SESSION[key],
			set: (key, value) => SESSION[key] = value
		},
		payload: payload || {},
		params: params || {}
	};
}

describe('Shop cart routes handlers', () => {

	before(done => {
		database.connect(done);
	});

	after(done => {
		database.disconnect(done);
	});

	beforeEach(() => {
		SESSION = {};
	});

	it('Should add products to shop cart', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 13
		});

		shopCartHandlers.addProductToCart(request, (err, shopCart) => {
			expect(shopCart).to.contains.all.keys(['orderId', 'orderItems']);
			expect(shopCart.orderItems[0]).to.contain.all.keys(['id', 'productId', 'colorId', 'sizeId', 'quantity', 'detail']);
			expect(shopCart.orderItems[0].detail.toJSON()).to.contain.all.keys(['id', 'name', 'price', 'categoryId', 'colors', 'sizes', 'imagesUrls']);
			done();
		});

	});

	it('Should add quantity when adding an already added product', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 1
		});

		async.times(3, (index, next) => {
			shopCartHandlers.addProductToCart(clone(request), next);
		}, (err, shopCarts) => {
			expect(err).to.equals(null);
			expect(shopCarts.every(shopCart => shopCart.orderItems[0].productId === request.payload.productId)).to.equal(true);
			shopCarts[2].orderItems[0].quantity = 3;
			done();
		});
	});

	it('Should return the shop cart', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 5
		});
		async.series({
			addProductCart: next => {
				shopCartHandlers.addProductToCart(request, next);
			},
			cart: next => {
				shopCartHandlers.getShopCart(request, next);
			}
		}, (err, data) => {
			expect(err).to.equals(null);
			expect(data.cart.orderItems).to.have.lengthOf(1);
			expect(data.cart.orderItems[0].productId).to.equals('0202017039');
			expect(data.cart.orderItems[0].quantity).to.equals(5);
			done();
		});
	});

	it('Should add an order-item to the shop-cart', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 5
		});
		async.waterfall([
			function bootstrapCheck(next) {
				shopCartHandlers.getShopCart(request, (err, shopCart) => {
					expect(err).to.equals(null);
					expect(shopCart.orderItems).to.have.lengthOf(0);
					next();
				});
			},
			function addProductCart(next) {
				shopCartHandlers.addProductToCart(request, next);
			},
			function checkCart(shopCart, next) {
				expect(shopCart.orderItems).to.have.lengthOf(1);
				next(null, shopCart.orderItems[0].id);
			},
			function removeProductFromCart(orderItemId, next) {
				var req = _createFakeRequest(null, {orderItemId});
				shopCartHandlers.removeOrderItemFromCart(req, (err, newCart) => {
					expect(err).to.equals(null);
					expect(newCart.orderItems).to.have.lengthOf(0);
					next();
				});
			},
			function checkCartAgain(next) {
				shopCartHandlers.getShopCart(request, (err, shopCart) => {
					expect(err).to.equals(null);
					expect(shopCart.orderItems).to.have.lengthOf(0);
					next();
				});
			}
		], done);
	});

	it('Should return an error when trying to add a non existing order-item', done => {
		const request = _createFakeRequest(
			{
				productId: '0202017039',
				colorId: '0202017007',
				sizeId: '005',
				quantity: 5
			},
			{
				orderItemId: 'ZZZ'
			}
		);

		async.series({
			addProductCart: next => {
				shopCartHandlers.addProductToCart(request, next);
			},
			removeOrderItemFromCart: next => {
				shopCartHandlers.removeOrderItemFromCart(request, next);
			}
		}, err => {
			expect(err).to.be.an.instanceof(Error);
			expect(err.output.statusCode).to.equals(404);
			expect(err.output.payload.message).to.equals('Order Item not found in shop cart');
			done();
		});
	});

	it('Should update an order-item in shop-cart', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 5
		});

		async.waterfall([
			function addProductToCart(next) {
				shopCartHandlers.addProductToCart(request, next);
			},
			function updateOrderItem(shopCart, next) {
				expect(shopCart.orderItems).to.have.length(1);
				expect(shopCart.orderItems[0].productId).to.equals('0202017039');
				expect(shopCart.orderItems[0].quantity).to.equals(5);
				
				let orderItem = Object.assign({}, shopCart.orderItems[0]);
				orderItem.quantity = 10;
				shopCartHandlers.updateOrderItemInCart(_createFakeRequest(orderItem), (err, shopCart) => {
					expect(err).to.equals(null);
					expect(shopCart.orderItems).to.have.length(1);
					expect(shopCart.orderItems[0].productId).to.equals('0202017039');
					expect(shopCart.orderItems[0].quantity).to.equals(10);
					expect(shopCart.orderItems[0]).to.deep.equals(orderItem);
					next();
				});
			},

		], done);
	});

	it('Should return an error when trying to update a non existing order-item', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 5
		});

		async.waterfall([
			function addProductToCart(next) {
				shopCartHandlers.addProductToCart(request, next);
			},
			function updateOrderItem(shopCart, next) {
				expect(shopCart.orderItems).to.have.length(1);
				expect(shopCart.orderItems[0].productId).to.equals('0202017039');
				expect(shopCart.orderItems[0].quantity).to.equals(5);
				
				let orderItem = Object.assign({}, shopCart.orderItems[0]);
				orderItem.id = 'unknown-order-item-id';
				shopCartHandlers.updateOrderItemInCart(_createFakeRequest(orderItem), (err, shopCart) => {
					expect(err).to.be.an.instanceof(Error);
					expect(err.output.statusCode).to.equals(404);
					expect(err.output.payload.message).to.equals('Order Item not found in shop cart');
					done();
				});
			},

		], done);
	});

});
