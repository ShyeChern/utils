const { express, constants, validator } = require('../../../lib');

// TODO: convert to ts
describe('express/init', () => {
	describe('init', () => {
		test('should able to init', async () => {
			const result = await express.init();
			expect(result).toBe(undefined);
		});
	});
});
