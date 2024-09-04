const { array } = require('../../lib');

describe('utils/array', () => {
	describe('sort', () => {
		const arrayOfNumber = [4, 11.1, 11, 11.6, 30, 1, 22, 55, 33, 31];
		const arrayOfObjects = [
			{ string: 'apple', number: 3 },
			{ string: 'Banana', number: 2 },
			{ string: 'Coconut', number: 1 },
			{ string: 'coconut', number: 5 },
			{ string: 'Apple', number: 4 },
		];

		test('should able to sort numeric and string value', () => {
			const sortedNumeric = array.sort(arrayOfNumber, { numeric: true });
			const expectedNumeric = [...arrayOfNumber].sort((a, b) => a - b);
			const sortedString = array.sort(arrayOfNumber);
			const expectedString = [...arrayOfNumber].sort();
			expect(sortedNumeric.toString()).toBe(expectedNumeric.toString());
			expect(sortedString.toString()).toBe(expectedString.toString());
		});

		test('should able to sort array of object', () => {
			const sortedArrayOfObjects = array.sort(arrayOfObjects, { field: 'number', numeric: true });
			expect(sortedArrayOfObjects[0].number).toBe(1);
			expect(sortedArrayOfObjects[sortedArrayOfObjects.length - 1].number).toBe(5);
		});

		test('should able to sort array in ascending and decending', () => {
			const sortedArrayAscending = array.sort(arrayOfObjects, {
				field: 'number',
				numeric: true,
				reverse: false,
			});
			const sortedArrayDescending = array.sort(arrayOfObjects, {
				field: 'number',
				numeric: true,
				reverse: true,
			});
			expect(sortedArrayAscending[0].number).toBe(1);
			expect(sortedArrayAscending[sortedArrayAscending.length - 1].number).toBe(5);
			expect(sortedArrayDescending[0].number).toBe(5);
			expect(sortedArrayDescending[sortedArrayDescending.length - 1].number).toBe(1);
		});

		test('should able to sort array by providing custom converter function', () => {
			const sortedArrayNumber = array.sort([6, 10, 2, 1.5, 1.2, 1.3, 1, 100.1, 100.5, 100.3, 10], {
				converter: parseInt,
				numeric: true,
			});
			expect(sortedArrayNumber[0]).toBe(1.5);
			expect(sortedArrayNumber[sortedArrayNumber.length - 1]).toBe(100.3);
		});

		test('should able to sort array by providing custom compare function', () => {
			const sortedArrayStringLength = array.sort(arrayOfObjects, {
				field: 'string',
				reverse: true,
				compare: (a, b) => {
					return a.length
						.toString()
						.localeCompare(b.length.toString(), undefined, { sensitivity: 'base', numeric: true });
				},
			});

			expect(sortedArrayStringLength[0].string).toBe('Coconut');
			expect(sortedArrayStringLength[sortedArrayStringLength.length - 1].string).toBe('Apple');
		});
	});

	describe('removeDuplicates', () => {
		const values = [1, 1, 2, 2, 3, 3];
		const objects = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' },
			{ id: 2, name: 'Alice' },
			{ id: 3, name: 'Charlie' },
		];

		test('should able to remove duplicate value of array', () => {
			const { result } = array.removeDuplicates(values);
			expect(result.length).toBe(3);
		});

		test('should able to remove duplicate value of array of object', () => {
			const { result } = array.removeDuplicates(objects, { field: 'name' });
			expect(result.length).toBe(3);
		});

		test('should able to remove empty value', () => {
			const { result: valueResult } = array.removeDuplicates([...values, undefined]);
			const { result: objectResult } = array.removeDuplicates(
				[...objects, { id: undefined, name: undefined }],
				{
					field: 'name',
				},
			);
			expect(valueResult.length).toBe(3);
			expect(objectResult.length).toBe(3);
		});

		test('should able to get unique value of array', () => {
			const { uniques } = array.removeDuplicates(values);
			expect(uniques.length).toBe(3);
			expect(uniques.every((v) => typeof v === 'number')).toBe(true);
		});

		test('should able to get unique value of array of object', () => {
			const { uniques } = array.removeDuplicates(objects, { field: 'name' });
			expect(uniques.length).toBe(3);
			expect(uniques.every((v) => typeof v === 'string')).toBe(true);
		});

		test('should able to provide custom converter to remove duplicates', () => {
			const { result, uniques } = array.removeDuplicates(objects, {
				converter: (v) => v.id + v.name,
			});

			expect(result.length).toBe(4);
			expect(uniques.length).toBe(4);
		});
	});

	describe('groupBy', () => {
		const arrayValues = [1, 1, 2, 2, 3, 3];
		const arrayObjects = [
			{ gender: 'f', name: 'Alice' },
			{ gender: 'm', name: 'Bob' },
			{ gender: 'F', name: 'Alice' },
			{ gender: 'm', name: 'Charlie' },
		];

		test('should able to group value of array', () => {
			const result = array.groupBy(arrayValues);
			expect(Object.keys(result).length).toBe(3);
		});

		test('should able to group array of object', () => {
			const result = array.groupBy(arrayObjects, { field: 'gender' });
			expect(Object.keys(result).length).toBe(3);
		});

		test('should able to provide custom converter to group array', () => {
			const result = array.groupBy(arrayObjects, { converter: (v) => v.gender.toLowerCase() });
			expect(Object.keys(result).length).toBe(2);
		});
	});
});
