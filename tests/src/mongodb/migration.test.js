const migrations = require('../../../lib/mongodb-core/migrations');

// TODO: convert to ts
describe('mongodb/migration', () => {
	test('should able to run seeder', async () => {
		const opts = {};
		const seeder = {};
		const result = await migrations.runMigrations({});
		expect(result).toBeTruthy();
	});
});
