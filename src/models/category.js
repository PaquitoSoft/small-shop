'use strict';

var mongoose = require('mongoose');

let categoryScheme = mongoose.Schema({
	id: String,
	name: String
});

module.exports = mongoose.model('Category', categoryScheme);
