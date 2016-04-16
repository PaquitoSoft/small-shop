'use strict';

const staticContentPlugin = require('inert'),
	yar = require('yar'),
	loggerPlugin = require('good'),
	loggerPluginConsoleReporter = require('good-console');

module.exports = [
	{
		name: 'static-content',
		plugin: staticContentPlugin
	},
	{
		name: 'logger',
		plugin: loggerPlugin,
		options: {
			reporters: [{
				reporter: loggerPluginConsoleReporter,
				events: {
					response: '*',
					log: '*'
				}
			}]
		}
	},
	{
		name: 'cookies',
		plugin: yar,
		options: {
			storeBlank: false,
			maxCookieSize: 0,
			cookieOptions: {
				password: 'fjadk=sfnd3ajh-kjaTsb.>kads-jkaf',
				isSecure: false
			}
		}
	}
];
