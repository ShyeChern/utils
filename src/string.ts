/**
 * Convert string to camel case
 * @todo optimize and check simpler way
 */
export const toCamelCase = (str: string) => {
	// https://www.rexegg.com/regex-boundaries.html#diyb
	return str.replace(
		/(?:^\w|[A-Z]|(?:(?=\w)(?<!\w)|(?<=\w_)(?!\w_))\w|\s+|-|_)/g,
		(match, index) => {
			// + ' ' === 0
			if (+match === 0 || match === '-' || match === '_') return '';
			return index === 0 ? match.toLowerCase() : match.toUpperCase();
		},
	);
};
