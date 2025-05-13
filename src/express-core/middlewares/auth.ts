import express from 'express';
import { asValue } from 'awilix';
import { TokenExpiredError } from 'jsonwebtoken';
import { security } from '../../utils';
import { BaseError, type ErrorParam } from '../../base';
import { cache, app, error as errorCode } from '../../constants';
import { User } from '../../types/user';
import { ExpressInitConfig } from '../init';

export const auth = (config: ExpressInitConfig) => {
	return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const whitelistUrl = {
			...config.whitelistUrl,
		};

		if (whitelistUrl[req.originalUrl]) return next();

		if (!req.headers.authorization) {
			return next(new BaseError(req.__('error.unauthorized'), app.UNAUTHORIZED));
		}

		try {
			const token = req.headers.authorization.replace('Bearer ', '');
			const payload = security.verifyToken(token);
			const user: User = await req.container.cradle.userRepository.verifyUser(payload);
			user.access = req.container.cradle.cache.get(cache.ROLE)[user.role];
			req.container.register({
				currentUser: asValue(user),
			});
			req.container.cradle.userRepository.currentUser = user;
		} catch (error) {
			req.container.cradle.logger.info(error);

			if (error instanceof BaseError) return next(error);

			const params: ErrorParam = {
				statusCode: app.UNAUTHORIZED,
			};
			if (error instanceof TokenExpiredError && error.name === 'TokenExpiredError')
				params.code = errorCode.TOKEN_EXPIRED;

			return next(new BaseError(req.__('error.unauthorized'), params));
		}
		return next();
	};
};
