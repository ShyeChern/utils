const mongodb = require('../../../lib/mongodb-core');
const AuditModel = require('../../../lib/mongodb-core/audits/audits.model');

// TODO: convert to ts
describe('mongodb', () => {
	test('should able to init', async () => {
		const result = await mongodb.init({ 'audits.model': AuditModel });
		await result.client.close();
		expect(result).toBeTruthy();
	});
});
