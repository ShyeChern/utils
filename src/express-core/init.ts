import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({
	path: path.resolve(process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'),
});
import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { container } from './container';
import * as middleware from './middlewares';
import { routes } from './routes';
const port = process.env.PORT;

export interface ExpressInitConfig {
	middlewares?: RequestHandler[];
	whitelistUrl?: Record<string, boolean>;
}

export const init = async (config: ExpressInitConfig = {}) => {
	const app = express();
	app.use(cors({ origin: true, credentials: true }));
	app.use(helmet());
	app.use(middleware.createScope);
	app.use(middleware.i18n);
	app.use(
		rateLimit({
			limit: 100,
			standardHeaders: true,
			legacyHeaders: false,
		}),
	);
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(compression());
	app.use(middleware.logger);
	app.use(middleware.cache);
	app.use(cookieParser(process.env.COOKIE_SIGNAGURE));
	if (config.middlewares) {
		for (const middleware of config.middlewares) {
			app.use(middleware);
		}
	}
	await container.cradle.init();
	app.use(routes(container.cradle, config));
	app.use(middleware.error);

	const server = app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});

	return server;
};
