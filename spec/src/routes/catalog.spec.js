'use strict';

const expect = require('chai').expect,
	async = require('async'),
	database = require('../../../src/lib/db'),
	catalogHandlers = require('../../../src/routes/catalog');

const PRODUCT_KEYS = ['id', 'name', 'price', 'categoryId', 'sizes', 'colors', 'imagesUrls'];

describe('Catalog routes handlers', () => {

	before(done => {
		database.connect(done);
	});

	after(done => {
		database.disconnect(done);
	});

	describe('Category', () => {
		it('Should return all categories', done => {
			catalogHandlers.getCategories({}, (err, categories) => {
				expect(err).to.equals(null);
				expect(categories).to.have.lengthOf(15);
				categories.forEach(category => {
					expect(category.toJSON()).to.contain.all.keys(['id', 'name']);
				});
				done();
			});
		});

		it('Should return a category details', done => {
			const fakeRequest = {params: {categoryId: '10'}};
			catalogHandlers.getCategoryDetail(fakeRequest, (err, category) => {
				expect(err).to.equals(null);
				expect(category.name).to.equals('Skirts');
				done();
			});
		});

		it('Should return a not found error when looking for an unknown category', done => {
			const fakeRequest = {params: {categoryId: '1000'}};
			catalogHandlers.getCategoryDetail(fakeRequest, (err, category) => {
				expect(category).to.equals(undefined);
				expect(err).to.be.an.instanceof(Error);
				expect(err.output.statusCode).to.equals(404);
				done();
			});
		});

		it('Should return a category products', done => {
			const fakeRequest = {params: {categoryId: '10'}};
			catalogHandlers.getCategoryProducts(fakeRequest, (err, products) => {
				expect(err).to.equals(null);
				expect(products).to.have.lengthOf(98);
				expect(products.filter(product => product.categoryId == 10)).to.have.lengthOf(98);
				done();
			});
		});

		it('Should return an empty products array for an unknown category (no error)', done => {
			const fakeRequest = {params: {categoryId: '1010'}};
			catalogHandlers.getCategoryProducts(fakeRequest, (err, products) => {
				expect(err).to.equals(null);
				expect(products).to.be.instanceof(Array);
				expect(products).to.have.lengthOf(0);
				done();
			});
		});
	});

	describe('Products', () => {
		it('Should return a product details', done => {
			const fakeRequest = {params: {productId: '0335025001'}};
			catalogHandlers.getProductDetail(fakeRequest, (err, product) => {
				expect(err).to.equals(null);
				expect(product.id).to.equals('0335025001');
				expect(product.toJSON()).to.contain.all.keys(PRODUCT_KEYS);
				done();
			});
		});

		it('Should return a not found error when looking for an unknown product', done => {
			const fakeRequest = {params: {productId: 'ZZZ'}};
			catalogHandlers.getProductDetail(fakeRequest, (err, product) => {
				expect(product).to.equals(undefined);
				expect(err).to.be.an.instanceof(Error);
				expect(err.output.statusCode).to.equals(404);
				done();
			});
		});

		it('Should return featured product list', done => {
			catalogHandlers.getFeaturedProducts({}, (err, products) => {
				expect(err).to.equals(null);
				expect(products).to.have.lengthOf(8);
				products.forEach(product => {
					expect(product.toJSON()).to.contain.all.keys(PRODUCT_KEYS);
				});
				done();
			});
		});

		it('Should return different featured product list every time', done => {
			async.times(2, (index, next) => {
				catalogHandlers.getFeaturedProducts({}, next);
			}, (err, featuredProducts) => {
				expect(err).to.equals(null);

				featuredProducts[0].forEach(product => {
					expect(featuredProducts[1].findIndex(_prod => _prod.id === product.id)).to.equals(-1);
				});

				done();
			});
		});
	});

});
