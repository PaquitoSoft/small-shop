'use strict';

const staticContentPlugin = require('inert'),
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
	}
];
