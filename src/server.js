'use strict';
const async = require('async'),
	Hapi = require('hapi'),
	mongoose = require('mongoose'),
	appConfig = require('./config/application-config'),
	pluginsConfig = require('./config/plugins'),
	routesConfig = require('./routes'),
	sharedMethods = require('./lib/server-methods'),
	database = require('./lib/db');

const server = new Hapi.Server();
server.connection({
	port: process.env.PORT || 3003,
	routes: {
		cors: {
			origin: ['*'],
			credentials: true
		}
	}
});

async.series({
	connectToDb: (next) => {
		console.log('Server# Connecting to database...');
		database.connect(next);
	},
	registerPlugins: (next) => {
		async.eachSeries(pluginsConfig, (pluginConfig, _next) => {
			console.log('Server# Registering plugin:', pluginConfig.name);
			server.register({
				register: pluginConfig.plugin,
				options: pluginConfig.options || {}
			}, _next);
		}, next);

	},
	registerSharedMethods: (next) => {
		console.log('Server# Configuring shared server methods...');
		sharedMethods.forEach(sharedMethod => {
			server.method(sharedMethod);
		});
		next();
	},
	registerRoutes: (next) => {
		console.log('Server# Configuring server routes...');
		routesConfig.configureRoutes(server);
		next();
	},
	startServer: (next) => {
		server.start(next);
	}
}, (err) => {
	if (err) { throw err; }
	console.log('Sever# Server up and running at:', server.info.uri);
});
