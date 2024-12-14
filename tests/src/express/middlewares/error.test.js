const middlewares = require('../../../../lib/express/middlewares');
const { BaseError, constants } = require('../../../../lib');

describe('express/middlewares', () => {
	describe('error', () => {
		const req = {
			__: (v) => v,
			container: {
				cradle: {
					logger: { error: () => {} },
					requestId: 'requestId',
				},
			},
		};

		test('should able handle BaseError', async () => {
			const message = 'error';
			const statusCode = 422;
			const code = 'CODE';
			const errorDetail = { field: 'someField' };
			const error = new BaseError(message, { statusCode, code, error: errorDetail });
			const result = middlewares.error(
				error,
				req,
				{
					status: (v) => (v === statusCode ? { send: (v) => v } : false),
				},
				(v) => v,
			);

			expect(result.message).toBe(message);
			expect(result.code).toBe(code);
			expect(result.error).toBe(errorDetail);
		});

		test('should able to handle unexpected error', async () => {
			const message = 'error';
			const result = middlewares.error(
				new Error(message),
				req,
				{
					status: (v) => (v === constants.app.INTERNAL_SERVER_ERROR ? { send: (v) => v } : false),
				},
				(v) => v,
			);
			expect(result.message).toBe('error.serverError');
			expect(result.requestId).toBe(req.container.cradle.requestId);
			expect(result.devError).toBe(message);
		});
	});
});
