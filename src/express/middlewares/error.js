const { BaseError } = require('../../base');
const { app } = require('../../constants');

module.exports = (err, req, res, _next) => {
	if (err instanceof BaseError) {
		return res
			.status(err.statusCode)
			.send({ message: err.message, code: err.code, error: err.error });
	}
	req.container.cradle.logger.error('error middleware', err);
	const errorResponse = {
		message: req.__('error.serverError'),
		requestId: req.container.cradle.requestId,
	};
	if (process.env.NODE_ENV !== 'production') errorResponse.devError = err.message;
	return res.status(app.INTERNAL_SERVER_ERROR).send(errorResponse);
};
