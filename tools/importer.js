'use strict';

var crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	request = require('request'),
	cheerio = require('cheerio'),
	async = require('async'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	mkdirp = require('mkdirp'),
	models = require('../src/models');

const BASE_URL = 'http://www2.hm.com/en_gb';
const IMAGE_DESTINATION_BASE_DIRECTORY = '../data/images';

function _clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function _hash(value) {
	return crypto.createHash('md5').update(value).digest('hex');
}

const categories = [
	{ id: 1, key: 'ladies/shop-by-product/accessories', name: 'Accesories' },
	{ id: 2, key: 'ladies/shop-by-product/basics', name: 'Basics' },
	{ id: 3, key: 'ladies/shop-by-product/blazers-and-waistcoats', name: 'Blazers and Waistcoasts' },
	{ id: 4, key: 'ladies/shop-by-product/cardigans-and-jumpers', name: 'Cardigans & Jumpers' },
	{ id: 5, key: 'ladies/shop-by-product/dresses', name: 'Dresses' },
	{ id: 6, key: 'ladies/shop-by-product/jackets-and-coats', name: 'Jackets & Coats' },
	{ id: 7, key: 'ladies/shop-by-product/jeans', name: 'Jeans' },
	{ id: 8, key: 'ladies/shop-by-product/jumpsuits', name: 'Jumpsuits' },
	{ id: 9, key: 'ladies/shop-by-product/nightwear', name: 'Nightwear' },
	{ id: 10, key: 'ladies/shop-by-product/skirts', name: 'Skirts' },
	{ id: 11, key: 'ladies/shop-by-product/shorts', name: 'Shorts' },
	{ id: 12, key: 'ladies/shop-by-product/sportswear', name: 'Sportswear' },
	{ id: 13, key: 'ladies/shop-by-product/swimwear', name: 'Swimwear' },
	{ id: 14, key: 'ladies/shop-by-product/tops', name: 'Tops' },
	{ id: 15, key: 'ladies/shop-by-product/trousers', name: 'Trousers' }
];

function connectToDb(done) {
	let db;
	mongoose.connect('mongodb://localhost/small-shop');
	db = mongoose.connection;
	db.on('error', done);
	db.once('open', done.bind(null, db));
}

function saveModel(modelData, modelClass, done) {
	console.log(`Saving model (${modelClass.name}): ${modelData.id}`);
	console.log(modelData);
	modelClass.findOne({id: modelData.id}, (err, model) => {
		if (err) {
			done(err);
		} else if (!model) {
			let _model = new modelClass(modelData);
			_model.save((err, savedModel) => {
				console.log('Model saved!');
				done(err, !!savedModel);
			});
		} else {
			console.log('Model already exists!');
			done(null, false);
		}
	});
}

function saveCategory(category, done) {
	saveModel(category, models.Category, done);
}

function downloadImage(url, destinationPath, done) {
	// http://lp2.hm.com/hmprod?set=source[/environment/2016/6IT_0326_017R.jpg],width[4127],height[4826],x[744],y[246],type[FASHION_FRONT]&hmver=0&call=url[file:/product/thumb]
	mkdirp.sync(path.dirname(destinationPath));
	request
		.get(`http:${url}`)
		.on('error', done)
		.on('end', done)
		.pipe(fs.createWriteStream(destinationPath));
}

function downloadProductDetailImages(product, done) {
	async.eachSeries(product.imagesUrls, (imageUrl, next) => {
		downloadImage(
			imageUrl,
			`${IMAGE_DESTINATION_BASE_DIRECTORY}/products/${product.id}/${_hash(imageUrl)}.jpg`,
			next
		);
	}, done);
}

function downloadProductColorImages(colors, done) {
	async.eachSeries(colors, (color, next) => {
		downloadImage(
			color.imageUrl,
			`${IMAGE_DESTINATION_BASE_DIRECTORY}/colors/${color.id}.jpg`,
			next
		);
	}, done);
}

function downloadProductImages(product, done) {
	console.log(`Saving product images (${product.id})...`);
	async.series([
		downloadProductDetailImages.bind(null, product),
		downloadProductColorImages.bind(null, product.colors)
	], (err) => {
		done(err);
	});
}

function transformProductImagesUrls(product, done) {
	console.log(`Transforming product images urls (${product.id})`);
	product.imagesUrls = product.imagesUrls.map(imgUrl => {
		return _hash(imgUrl);
	});
	product.colors = product.colors.map(color => {
		return _.extend(color, {imageUrl: _hash(color.imageUrl)});
	});
	done();
}

function getProductDetail(product, done) {
	/*
		Product page
		------------
		.product-detail
			.product-detail-thumbnails
				.product-detail-thumbnail img ----> product color thumbnails [thumb|main]

			.product-colors
				li label["title"] ---> colorName
				li input["data-articlecode"] ---> colorId
				li input["data-sizes"] ---> color available sizes
				li .detailbox img ---> colorImage

			.product-sizes
				ul.inputlist:first
					li input["data-size"] ---> sizeId
					li input["value"] ---> sizeName
					li input["disabled"] ---> out of stock

	*/

	console.log(`Let's process product (${product.id})...`);

	models.Product.findOne({id: product.id}, (err, _product) => {
		if (err) {
			done(err);
		} else if (!!_product) {
			console.log(`We already have this product (${product.id}): ${JSON.stringify(_product)}`);
			done(null, null); // If we already have this product we return null so we don't process it again
		} else {
			request(`${BASE_URL}/productpage.${product.id}.html`, (err, response, body) => {
				if (!err && response.statusCode < 300) {
					let $ = cheerio.load(body),
						$productDetail = $('.product-detail'),
						fullProduct = _clone(product);

					console.log(`Processing product: ${product.name} (${product.id})...`);

					fullProduct.imagesUrls = $productDetail.find('.product-detail-thumbnail-image').map((i, img) => {
						return $(img).attr('src').replace('thumb', 'main');
					}).get();
					fullProduct.colors = $productDetail.find('.product-colors').map((i, color) => {
						const $color = $(color);
						return {
							id: $color.find('li input').attr('data-articlecode'),
							name: $color.find('li input').val(),
							sizes: $color.find('li input').attr('data-sizes').split(','),
							imageUrl: $color.find('.detailbox img').attr('src')
						};
					}).get();
					fullProduct.sizes = $productDetail.find('.product-sizes ul.inputlist').first().find('li').map((i, size) => {
						const $size = $(size);
						return {
							id: $size.find('input').data('size'),
							name: $size.find('input').val()
						};
					}).get();

					done(null, fullProduct);

				} else {
					done(err || new Error('HTTP error (getProduct): ' + response.statusCode));
				}
			});
		}
	});
}

function getCategoryProducts(category, done) {
	request(`${BASE_URL}/${category.key}.html?&offset=30&page-size=100`, (err, response, body) => {
		if (!err && response.statusCode < 300) {
			let $ = cheerio.load(body);
			const liteProducts = $('.product-items-content .product-item').map((index, element) => {
				let el = $(element);
				return {
					id: el.find('.product-item-headline a').attr('href').match(/productpage\.(\d*)\.html/)[1],
					name: el.find('.product-item-headline a').text(),
					price: parseFloat(el.find('.product-item-price').text().trim().substr(1)).toFixed(2),
					oldPrice: undefined,
					categoryId: category.id
				};
			});
			console.log(`Let's iterate over category products (${liteProducts.length})`);
			async.mapSeries(liteProducts, getProductDetail, done);

		} else {
			done(err || new Error('HTTP error: ' + response.statusCode));
		}
	});
}


/* ------------------------------------------------------------------------------------------ */

connectToDb((err, db) => {
	if (!err) {
		async.eachSeries(categories, (category, next) => {
			console.log(`Let's process category: ${category.name}...`);
			saveCategory(category, (err) => {
				if (err) {
					next(err);
				} else {
					getCategoryProducts(category, (err, products) => {
						console.log(`Category (${category.name}) products: ${products.length} - ${JSON.stringify(products[0])}`);

						// We might have null objects in products array because already processed products
						async.eachSeries(products, (product, _next) => {
							if (product) {
								// 1. Download product images
								// 2. Change product images urls
								// 3. Save product
								async.series([
									downloadProductImages.bind(null, product),
									transformProductImagesUrls.bind(null, product),
									saveModel.bind(null, product, models.Product)
								], _next);
							} else {
								_next();
							}
						}, next);
					});
				}
			});

		}, (err) => {
			console.log(err);
			console.log('THE END!');
			db.close();
		});
	}
});
