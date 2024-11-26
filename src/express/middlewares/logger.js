module.exports = (req, res, next) => {
	req.container.cradle.logger.info('Start request');
	req.container.cradle.logger.info('headers', JSON.stringify(req.headers));
	req.container.cradle.logger.info(req.method, req.url);
	if (req.method !== 'GET') {
		req.container.cradle.logger.info('body', JSON.stringify(req.body));
	}

	const send = res.send;
	res.send = (responseBody) => {
		req.container.cradle.logger.info('response', JSON.stringify(responseBody));
		res.send = send;
		return res.send(responseBody);
	};

	res.on('finish', function () {
		req.container.cradle.logger.info('End request');
	});
	return next();
};
