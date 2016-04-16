'use strict';

const mongoose = require('mongoose'),
	appConfig = require('../config/application-config');

let connected = false,
	db;

module.exports.connect = (done) => {
	mongoose.connect(appConfig.database.connectionUrl);

	db = mongoose.connection;

	db.on('error', (err) => {
		console.error('Server# Database connection error:', err);
		if (!connected) {
			done(err);
		}
	});

	db.once('open', (err) => {
		if (!err) {
			connected = true;
		}
		done(err);
	});

};

module.exports.disconnect = (done) => {
	if (db) {
		db.close(() => {
			db = undefined;
			connected = false;
			done();
		});
	}
};
