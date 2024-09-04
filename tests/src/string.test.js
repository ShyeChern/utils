const { string } = require('../../lib');

describe('utils/string-helper', () => {
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
