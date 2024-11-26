const auth = require('./auth');
const createScope = require('./create-scope');
const logger = require('./logger');
const error = require('./error');
const i18n = require('./i18n');
const cache = require('./cache');

module.exports = {
	auth,
	createScope,
	logger,
	error,
	i18n,
	cache,
};
