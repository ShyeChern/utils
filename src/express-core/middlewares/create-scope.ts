import express from 'express';
import { container } from '../container';

export const createScope = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	req.container = container.cradle.createScope(req);
	return next();
};
