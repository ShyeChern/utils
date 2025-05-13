import { listModules } from 'awilix';
import express, { RequestHandler } from 'express';
import { app as appConstant } from '../constants';
import * as middleware from './middlewares';
import { type ExpressInitConfig } from './init';

const app = express();
const router = express.Router();

export interface Route {
	path: string;
	get: [...RequestHandler[], string];
	post: [...RequestHandler[], string];
	put: [...RequestHandler[], string];
	delete: [...RequestHandler[], string];
}

export interface RouteClass extends Function {
	new (...args: any[]): unknown;
	routes: Route[];
}

const handler = (controller: string, methodName: string) => {
	return function (req: express.Request, res: express.Response, next: express.NextFunction) {
		return req.container.cradle[controller][methodName](req, res, next);
	};
};

const apiRoutes = (opts: Record<string, unknown>) => {
	const modules = listModules(['src/*/*/*.route.js']);
	const prefix = '/api';
	for (const module of modules) {
		const version = module.path.split('/').at(-3);
		const data = opts[module.name] as RouteClass;
		const entity = data.name.replace(/Route$/, '');
		const controllerName = entity.charAt(0).toLowerCase() + entity.slice(1) + 'Controller';

		for (const route of data.routes) {
			const methods = Object.keys(route).filter(
				(v): v is Exclude<keyof Route, 'path'> => v !== 'path',
			);

			for (const method of methods) {
				const length = route[method].length;
				route[method][length - 1] = handler(controllerName, route[method][length - 1] as string);
				router[method](`${prefix}/${version}/${route.path}`, route[method] as RequestHandler[]);
			}
		}
	}
	return router;
};

export const routes = (opts: Record<string, unknown>, config: ExpressInitConfig) => {
	app.use(middleware.auth(config), apiRoutes(opts));

	app.use('/*notFound', (req, res) => {
		res.status(appConstant.NOT_FOUND).send(`${req.method} ${req.originalUrl} endpoint not found`);
	});

	return app;
};
