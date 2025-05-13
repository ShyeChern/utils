const { expressCore } = require('../../../lib');

describe('express/init', () => {
	describe('init', () => {
		test('should able to init without config', async () => {
			const server = await expressCore.init();
			server.close();
			expect(server).toBeTruthy();
		});

		test('should able to init with config', async () => {
			const server = await expressCore.init({
				middlewares: [],
				whitelistUrl: { 'api/login': true },
			});
			server.close();
			expect(server).toBeTruthy();
		});
	});
});
