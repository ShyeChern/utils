import express from 'express';
import { BaseError } from '../../base';
import { security } from '../../utils';
import { app } from '../../constants';

export const cipher = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const key = req.headers['AES-HEX-KEY'];
	if (key === process.env.AES_HEX_KEY) return next();
	if (req.method !== 'GET') {
		try {
			req.body = security.decrypt(req.body);
			req.container.cradle.logger.info('body after decrypted', JSON.stringify(req.body));
		} catch (error) {
			return next(new BaseError(req.__('error.forbidden'), app.FORBIDDEN));
		}
	}

	const send = res.send;
	res.send = (responseBody) => {
		req.container.cradle.logger.info('response before encrypted', JSON.stringify(responseBody));
		const response = security.encrypt(responseBody);
		res.send = send;
		return res.send(response);
	};

	return next();
};
