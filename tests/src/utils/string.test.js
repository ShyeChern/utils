const { string } = require('../../../lib');

describe('utils/string-helper', () => {
	describe('toCamelCase', () => {
		test('should convert normal text into camel case', () => {
			const result = string.toCamelCase('normal text');
			expect(result).toBe('normalText');
		});

		test('should convert pascal case into camel case', () => {
			const result = string.toCamelCase('PascalCase');
			expect(result).toBe('pascalCase');
		});

		test('should convert kebab case into camel case', () => {
			const result = string.toCamelCase('kebab-case');
			expect(result).toBe('kebabCase');
		});

		test('should convert snake case into camel case', () => {
			const result = string.toCamelCase('snake_case');
			expect(result).toBe('snakeCase');
		});

		test('should convert camel case into camel case', () => {
			const result = string.toCamelCase('camelCase');
			expect(result).toBe('camelCase');
		});
	});

	describe('isJson', () => {
		test('should convert if it is a valid json string', () => {
			const json = { value: 123 };
			const result = string.isJson(JSON.stringify(json));
			expect(result.value).toBe(json.value);
		});

		test('should not convert if it is not a valid json string', () => {
			const invalidJson = 'string';
			const result = string.isJson(invalidJson);
			expect(result).toBe(invalidJson);
		});

		test('should return boolean value if passed option convert as false', () => {
			const json = { value: 123 };
			const result = string.isJson(JSON.stringify(json), { convert: false });
			expect(result).toBe(true);
		});
	});
});
