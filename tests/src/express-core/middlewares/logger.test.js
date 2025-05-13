const middlewares = require('../../../../lib/express-core/middlewares');
const { BaseError, constants } = require('../../../../lib');

describe('express/middlewares', () => {
	describe('logger', () => {
		const req = {
			headers: {},
			method: 'GET',
			url: 'https://localhost',
			body: {},
			container: {
				cradle: {
					logger: { info: console.info },
				},
			},
		};

		const res = { send: jest.fn().mockReturnValue(true), on: (event, func) => func() };

		test('should able log GET request info', async () => {
			const spyFunc = jest.spyOn(req.container.cradle.logger, 'info');
			middlewares.logger(req, res, (v) => v);
			res.send();
			expect(spyFunc).toHaveBeenCalledTimes(5);
			spyFunc.mockRestore();
		});

		test('should able log body request info', async () => {
			req.method = 'POST';
			const spyFunc = jest.spyOn(req.container.cradle.logger, 'info');
			middlewares.logger(req, res, (v) => v);
			res.send();
			expect(spyFunc).toHaveBeenCalledTimes(6);
			spyFunc.mockRestore();
		});
	});
});
