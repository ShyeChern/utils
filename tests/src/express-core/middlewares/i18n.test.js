const middlewares = require('../../../../lib/express-core/middlewares');

describe('express/middlewares', () => {
	describe('i18n', () => {
		const req = {};
		middlewares.i18n(req, {}, (v) => v);
		// running without docker cannot read file path properly
		req.setLocale('en');

		test('should able handle translation', async () => {
			const catalog = req.getCatalog();
			expect(catalog.error).toBeTruthy();
			expect(catalog.validation).toBeTruthy();
		});
	});
});
