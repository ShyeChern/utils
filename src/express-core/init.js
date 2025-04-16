const path = require('node:path');
require('dotenv').config({
	path: path.resolve(process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'),
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const container = require('./container');
const middleware = require('./middlewares');
const routes = require('./routes');
const port = process.env.PORT;

/**
 * @param {object} config
 * @param {function[]} config.middlewares
 * @param {object} config.whitelistUrl
 */
module.exports = async (config) => {
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
	await container.cradle.init();
	app.use(routes(container.cradle, config));
	app.use(middleware.error);

	app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
};
