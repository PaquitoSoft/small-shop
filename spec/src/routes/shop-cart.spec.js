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

	it('Should remove products from shop cart', done => {
		const request = _createFakeRequest({
			productId: '0202017039',
			colorId: '0202017007',
			sizeId: '005',
			quantity: 5
		});
		async.series({
			bootstrapCheck: next => {
				shopCartHandlers.getShopCart(request, (err, shopCart) => {
					expect(err).to.equals(null);
					expect(shopCart.orderItems).to.have.lengthOf(0);
					next();
				});
			},
			addProductCart: next => {
				shopCartHandlers.addProductToCart(request, next);
			},
			checkCart: next => {
				shopCartHandlers.getShopCart(request, (err, shopCart) => {
					expect(err).to.equals(null);
					expect(shopCart.orderItems).to.have.lengthOf(1);
					next();
				});
			},
			removeProductFromCart: next => {
				var req = _createFakeRequest(null, {productId: '0202017039'});
				shopCartHandlers.removeProductFromCart(req, (err, newCart) => {
					expect(err).to.equals(null);
					expect(newCart.orderItems).to.have.lengthOf(0);
					next();
				});
			},
			checkCartAgain: next => {
				shopCartHandlers.getShopCart(request, (err, shopCart) => {
					expect(err).to.equals(null);
					expect(shopCart.orderItems).to.have.lengthOf(0);
					next();
				});
			}
		}, done);
	});

	it('Should return a 404 error when trying to remove a non existing product', done => {
		const request = _createFakeRequest(
			{
				productId: '0202017039',
				colorId: '0202017007',
				sizeId: '005',
				quantity: 5
			},
			{
				productId: 'ZZZ'
			}
		);

		async.series({
			addProductCart: next => {
				shopCartHandlers.addProductToCart(request, next);
			},
			removeProductFromCart: next => {
				shopCartHandlers.removeProductFromCart(request, next);
			}
		}, err => {
			expect(err).to.be.an.instanceof(Error);
			expect(err.output.statusCode).to.equals(404);
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

});
