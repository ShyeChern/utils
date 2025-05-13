import express from 'express';

export const cache = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const cache = req.container.cradle.cache.get(req.originalUrl);

	const send = res.send;
	res.send = (responseBody) => {
		if (
			req.method === 'GET' &&
			res.statusCode >= 200 &&
			res.statusCode < 300 &&
			!req.container.cradle.cache.get(req.originalUrl)
		) {
			req.container.cradle.cache.set(req.originalUrl, responseBody, 5);
		}

		res.send = send;

		return res.send(responseBody);
	};

	if (cache && req.method === 'GET') {
		res.send(cache);
		return;
	}
	return next();
};
