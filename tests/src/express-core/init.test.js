const { expressCore } = require('../../../lib');

describe('express/init', () => {
	describe('init', () => {
		test('should able to init without config', async () => {
			const result = await expressCore.init();
			expect(result).toBeTruthy();
		});

		test('should able to init with config', async () => {
			const result = await expressCore.init({
				middlewares: [],
				whitelistUrl: { 'api/login': true },
			});
			expect(result).toBeTruthy();
		});
	});
});
