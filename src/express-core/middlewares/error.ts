import express from 'express';
import { BaseError } from '../../base';
import { app } from '../../constants';

export const error = (
	error: Record<string, unknown>,
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	if (error instanceof BaseError) {
		return res
			.status(error.statusCode)
			.send({ message: error.message, code: error.code, error: error.error });
	}
	req.container.cradle.logger.error('error middleware', error);
	const errorResponse: Record<string, unknown> = {
		message: req.__('error.serverError'),
		requestId: req.container.cradle.requestId,
	};
	if (process.env.NODE_ENV !== 'production') errorResponse.devError = error.message;
	return res.status(app.INTERNAL_SERVER_ERROR).send(errorResponse);
};
