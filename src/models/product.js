'use strict';

var mongoose = require('mongoose');

let productSchema = mongoose.Schema({
	id: String,
	name: String,
	price: Number,
	categoryId: Number,
	imagesUrls: Array,
	colors: [{
		_id: false,
		id: String,
		name: String,
		imageUrl: String,
		sizes: [String]
	}],
	sizes: [{
		_id: false,
		id: String,
		name: String
	}]
});

module.exports = mongoose.model('Product', productSchema);
