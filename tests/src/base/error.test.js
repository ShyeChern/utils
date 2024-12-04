const { BaseError } = require('../../../lib');

describe('base/error', () => {
	const message = 'Error Message';
	const statusCode = 400;
	const code = 'SOME_ERROR_CODE';
	const errorDetail = { field: 'someField' };

	describe('BaseError', () => {
		test('should able to accept error message', () => {
			const error = new BaseError(message);
			expect(error.message).toBe(message);
		});

		test('should able to accept object error params', () => {
			const error = new BaseError(message, {
				statusCode: statusCode,
				code: code,
				error: errorDetail,
			});
			expect(error.statusCode).toBe(statusCode);
			expect(error.code).toBe(code);
			expect(error.error).toBe(errorDetail);
		});

		test('should able to accept number error params', () => {
			const error = new BaseError(message, statusCode);
			expect(error.statusCode).toBe(statusCode);
			expect(error.code).toBe(undefined);
			expect(error.error).toBe(undefined);
		});

		test('should able to accept string error params', () => {
			const error = new BaseError(message, code);
			expect(error.statusCode).toBe(statusCode);
			expect(error.code).toBe(code);
			expect(error.error).toBe(undefined);
		});
	});
});
