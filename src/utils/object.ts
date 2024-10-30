/**
 * Get new and old value of two objects in root level
 * @todo implement deep and recursive check
 */
export const getDiff = (oldValue: Record<string, any>, newValue: Record<string, any>) => {
	const diff: { old: Record<string, any>; new: Record<string, any> } = {
		old: {},
		new: {},
	};

	const keys = [...new Set([...Object.keys(oldValue), ...Object.keys(newValue)])];

	for (const key of keys) {
		const prev = oldValue[key];
		const after = newValue[key];

		if (prev === after) continue;

		if (
			typeof prev === 'object' &&
			typeof after === 'object' &&
			JSON.stringify(prev) === JSON.stringify(after)
		) {
			continue;
		}

		diff.old = { ...diff.old, [key]: prev };
		diff.new = { ...diff.new, [key]: after };
	}

	return diff;
};
