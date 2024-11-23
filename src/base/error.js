const { app } = require('../constants');

module.exports = class BaseError extends Error {
	/**
	 * @typedef {object} ErrorParam
	 * @property {number} [statusCode]
	 * @property {string} [code]
	 * @property {object} [error]
	 * @param {string} message
	 * @param {string|number|ErrorParam} [params]
	 */
	constructor(message, params) {
		super(message);
		this.processParams(params);
	}

	processParams(params) {
		if (typeof params === 'string') {
			this.setCode(params);
			this.setStatusCode(app.BAD_REQUEST);
			return;
		}

		if (typeof params === 'number') {
			this.setStatusCode(params);
			return;
		}

		this.setStatusCode(params?.statusCode ?? app.BAD_REQUEST);
		this.setError(params?.error);
		this.setCode(params?.code);
	}

	setStatusCode(statusCode) {
		this.statusCode = statusCode;
	}

	setError(error) {
		this.error = error;
	}

	setCode(code) {
		this.code = code;
	}
};
