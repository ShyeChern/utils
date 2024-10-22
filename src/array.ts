// eslint-disable-next-line no-unused-vars
type ConverterFunction = (v: any, ...args: any[]) => any;

type ConverterOption = {
	/** converter function to get value of element */
	converter?: ConverterFunction;
	/** field of object and also serve as key to detect array of object */
	field?: string;
};

const getConverter = (options: ConverterOption): ConverterFunction => {
	if (options.converter) return options.converter;
	if (options.field) return (v) => v[options.field!];
	return (v) => v;
};

type SortOption = ConverterOption & {
	/** is descending order */
	reverse?: boolean;
	/** is numeric value */
	numeric?: boolean;
	/** compare function to determine order of element */
	// eslint-disable-next-line no-unused-vars
	compare?: (a: any, b: any) => any;
};

/**
 * Sort array. Defaults to sort array in ascending with case insensitivity (base)
 */
export const sort = <T>(arr: T[], options: SortOption = {}) => {
	const multiplier = options.reverse ? -1 : 1;
	const converter = getConverter(options);
	const numeric = options.numeric ?? false;
	const compare =
		options.compare ?? new Intl.Collator(undefined, { sensitivity: 'base', numeric }).compare;

	const result = [...arr].sort((a, b) => {
		const valueA = converter(a);
		const valueB = converter(b);

		return multiplier * compare(valueA, valueB);
	});

	return result;
};

/**
 * Removes duplicate values from array and return unique array (result) and the unique values (uniques)
 */
export const removeDuplicates = <T>(arr: T[], options: ConverterOption = {}) => {
	const converter = getConverter(options);

	const seen: Record<string, any> = {};
	const uniqueArray = arr.filter((v) => {
		const value = converter(v);
		if (Object.prototype.hasOwnProperty.call(seen, value)) return false;
		if (!value && value !== 0) return false;

		seen[value] = value;
		return true;
	});

	return { result: uniqueArray, uniques: Object.values(seen) };
};

type GroupByOption = ConverterOption & {
	/** is single object */
	single?: boolean;
};

/**
 * Group by value in array
 */
export const groupBy = <T>(arr: T[], options: GroupByOption = {}) => {
	const converter = getConverter(options);
	const result: Record<string, any> = {};
	const isSingle = options.single ?? false;

	for (const value of arr) {
		const key = converter(value);
		if (isSingle) {
			result[key] = value;
			continue;
		}
		if (!result[key]) result[key] = [];
		result[key].push(value);
	}

	return result;
};
