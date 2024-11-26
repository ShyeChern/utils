const { listModules } = require('awilix');
const express = require('express');
const app = express();
const { app: appConstant } = require('../constants');
const middleware = require('./middlewares');
const router = express.Router();

const handler = (controller, methodName) => {
	return function (req, res, next) {
		return req.container.cradle[controller][methodName](req, res, next);
	};
};

const apiRoutes = (opts) => {
	const modules = listModules(['src/*/*/*.route.js']);
	const prefix = '/api';
	for (const module of modules) {
		const version = module.path.split('/').at(-3);
		const data = opts[module.name];
		const entity = data.name.replace(/Route$/, '');
		const controllerName = entity.charAt(0).toLowerCase() + entity.slice(1) + 'Controller';

		for (const route of data.routes) {
			const methods = Object.keys(route).filter((v) => v !== 'path');
			for (const method of methods) {
				const length = route[method].length;
				route[method][length - 1] = handler(controllerName, route[method][length - 1]);
				router[method](`${prefix}/${version}/${route.path}`, route[method]);
			}
		}
	}
	return router;
};

module.exports = (opts, config) => {
	app.use(middleware.auth(config), apiRoutes(opts));

	app.use('/*', (req, res) => {
		res.status(appConstant.NOT_FOUND).send(`${req.method} ${req.originalUrl} endpoint not found`);
	});

	return app;
};
