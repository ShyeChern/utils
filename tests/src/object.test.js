const { object } = require('../../lib');

describe('utils/object', () => {
	describe('getDiff', () => {
		const oldValue = {
			string: 'string',
			number: 1,
			null: null,
			type: '123456',
			date: new Date(2023, 0, 1),
			array: [1, 2],
			object: { a: 1, b: 2 },
		};
		const newValue = {
			string: 'string',
			number: 2,
			boolean: false,
			type: 123456,
			date: new Date(2024, 0, 1),
			array: ['1', '2'],
			object: { a: 2, b: 1 },
		};
		const diff = object.getDiff(oldValue, newValue);

		test('should return difference of two object', () => {
			expect(Object.keys(diff.old).length).toBe(Object.keys(diff.old).length);
		});

		test('should compare both of the object keys', () => {
			expect(diff.old.boolean).toBe(oldValue.boolean);
			expect(diff.new.boolean).toBe(newValue.boolean);
		});

		test('should return difference value of two object', () => {
			expect(diff.old.number).toBe(oldValue.number);
			expect(diff.new.number).toBe(newValue.number);
		});

		test('should return difference type of two object', () => {
			expect(diff.old.type).toBe(oldValue.type);
			expect(diff.new.type).toBe(newValue.type);
		});

		test('should be able to compare date difference', () => {
			expect(diff.old.date).toBe(oldValue.date);
			expect(diff.new.date).toBe(newValue.date);
		});

		test('should be able to compare array', () => {
			expect(diff.old.array).toBe(oldValue.array);
			expect(diff.new.array).toBe(newValue.array);
		});

		test('should be able to compare object', () => {
			expect(diff.old.object).toBe(oldValue.object);
			expect(diff.new.object).toBe(newValue.object);
		});
	});
});
