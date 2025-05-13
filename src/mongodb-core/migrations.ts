import { listModules } from 'awilix';
import mongoose from 'mongoose';
import { array } from '../utils';
import { ContainerModule } from 'express-core';

export type SeederMigrationFunction = (db: mongoose.Connection) => Promise<void>;

export const runMigrations = async (opts: Record<string, unknown>, db: mongoose.Connection) => {
	const seeds: ContainerModule[] = array.sort(
		[
			...listModules(['../mongodb-core/seeders/*.seeder.js'], { cwd: __dirname }),
			...listModules(['src/mongodb/seeders/*.seeder.js']),
		],
		{ field: 'name' },
	);
	const migrations: ContainerModule[] = array.sort(
		[
			...listModules(['../mongodb-core/migrations/*.migration.js'], { cwd: __dirname }),
			...listModules(['src/mongodb/migrations/*.migration.js']),
		],
		{
			field: 'name',
		},
	);

	const seederCollection = db.collection<{ _id: string; [key: string]: unknown }>('seeders');
	const migrationCollection = db.collection<{ _id: string; [key: string]: unknown }>('migrations');
	const existingSeeders = await seederCollection.find().toArray();
	const existingMigrations = await migrationCollection.find().toArray();

	for (const seed of seeds) {
		if (existingSeeders.some((v) => v._id === seed.name)) continue;
		const func = opts[seed.name] as SeederMigrationFunction;
		await func(db);
		await seederCollection.insertOne({ _id: seed.name, createdAt: new Date() });
	}

	for (const migration of migrations) {
		if (existingMigrations.some((v) => v._id === migration.name)) continue;
		const func = opts[migration.name] as SeederMigrationFunction;
		await func(db);
		await migrationCollection.insertOne({ _id: migration.name, createdAt: new Date() });
	}

	console.log('migrations completed');
};
