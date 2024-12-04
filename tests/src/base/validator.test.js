const { validator, constants } = require('../../../lib');

describe('base/validator', () => {
	describe('pagination', () => {
		test('should able to validate pagination', () => {
			const data = { limit: 20, page: 2, sorts: ['_id,-1'] };
			const result = validator.pagination.validate(data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify(data));
		});

		test('should able to return default value for limit and page', () => {
			const result = validator.pagination.validate({});
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify({ limit: 10, page: 1 }));
		});

		test('should able to validate sort in expected format', () => {
			const result = validator.pagination.validate({ sorts: ['123,12'] });
			expect(result.error.details[0].type).toBe('string.pattern.base');
		});
	});

	describe('file', () => {
		test('should able to validate file', () => {
			const data = {
				destination: 'uploads/directory/',
				filename: 'filename.txt',
				path: 'uploads/directory/filename.txt',
			};
			const result = validator.file.validate(data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify(data));
		});
	});

	describe('pdf', () => {
		test('should able to validate pdf', () => {
			const data = {
				destination: 'uploads/directory/',
				filename: 'filename.txt',
				path: 'uploads/directory/filename.txt',
				mimetype: constants.file.MIME_TYPE.PDF,
			};
			const result = validator.pdf.validate(data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify(data));
		});
	});

	describe('excel', () => {
		test('should able to validate excel', () => {
			const data = {
				destination: 'uploads/directory/',
				filename: 'filename.txt',
				path: 'uploads/directory/filename.txt',
				mimetype: constants.file.MIME_TYPE.XLSX,
			};
			const result = validator.excel.validate(data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify(data));
		});
	});

	describe('image', () => {
		test('should able to validate image', () => {
			const data = {
				destination: 'uploads/directory/',
				filename: 'filename.txt',
				path: 'uploads/directory/filename.txt',
				mimetype: constants.file.MIME_TYPE.JPEG,
			};
			const result = validator.image.validate(data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify(data));
		});
	});

	describe('concurrency', () => {
		test('should able to validate concurrency', () => {
			const data = {
				updatedAt: new Date().toISOString(),
			};
			const result = validator.concurrency.validate(data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result.value)).toBe(JSON.stringify(data));
		});
	});
});
