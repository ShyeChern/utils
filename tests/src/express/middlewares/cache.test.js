const middlewares = require('../../../../lib/express/middlewares');
const { constants, security } = require('../../../../lib');

describe('express/middlewares', () => {
	describe('cache', () => {
		const cache = {};
		const originalUrl = '/api/users';
		const req = {
			method: 'GET',
			originalUrl,
			container: {
				cradle: {
					cache: { get: (v) => cache[v], set: (path, value) => (cache[path] = value) },
				},
			},
		};
		const data = { data: 'test' };

		test('should able to cache GET response with status code 200 to 299', async () => {
			const res = { send: (v) => v, statusCode: 200 };
			expect(cache[originalUrl]).toBe(undefined);
			middlewares.cache(req, res, (v) => v);
			res.send(data);
			expect(cache[originalUrl]).toBe(data);
		});

		test('should able to send cached response', async () => {
			let result;
			const res = { send: (v) => (result = v) };
			middlewares.cache(req, res, (v) => v);
			expect(result).toBe(cache[originalUrl]);
		});
	});
});
