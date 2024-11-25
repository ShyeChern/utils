const { listModules } = require('awilix');
const { array } = require('../utils');

module.exports.runMigrations = async (opts, db) => {
	const seeds = array.sort(
		[
			...listModules(['../mongodb/seeders/*.seeder.js'], { cwd: __dirname }),
			...listModules(['src/mongodb/seeders/*.seeder.js']),
		],
		{ field: 'name' },
	);
	const migrations = array.sort(
		[
			...listModules(['../mongodb/migrations/*.migration.js'], { cwd: __dirname }),
			...listModules(['src/mongodb/migrations/*.migration.js']),
		],
		{
			field: 'name',
		},
	);

	const seederCollection = db.collection('seeders');
	const migrationCollection = db.collection('migrations');
	const existingSeeders = await seederCollection.find().toArray();
	const existingMigrations = await migrationCollection.find().toArray();

	for (const seed of seeds) {
		if (existingSeeders.some((v) => v._id === seed.name)) continue;
		await opts[seed.name](db);
		await seederCollection.insertOne({ _id: seed.name, createdAt: new Date() });
	}

	for (const migration of migrations) {
		if (existingMigrations.some((v) => v._id === migration.name)) continue;
		await opts[migration.name](db);
		await migrationCollection.insertOne({ _id: migration.name, createdAt: new Date() });
	}

	console.log('migrations completed');
};
