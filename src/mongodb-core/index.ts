import mongoose, { ToObjectOptions } from 'mongoose';
import { listModules } from 'awilix';
import { initMiddleware } from './middlewares';
import { runMigrations } from './migrations';

export interface ModelClass extends Function {
	new (...args: any[]): unknown;
	modelName: string;
	schema: mongoose.Schema<Record<string, unknown>>;
	timestamps: boolean;
	author: boolean;
	paranoid: boolean;
	compoundIndexes: Record<string, -1 | 1>[];
	middleware: boolean;
}

export const init = async (opts: Record<string, unknown>) => {
	const mongodb = await mongoose.createConnection(process.env.MONGODB_URL ?? '').asPromise();

	if (process.env.NODE_ENV !== 'production') {
		mongoose.set(
			'debug',
			function (
				collectionName: string,
				methodName: string,
				...methodArgs: Record<string, unknown>[]
			) {
				console.log(
					`Mongoose: ${collectionName}.${methodName}(${methodArgs
						.map((v) => {
							const { auditService, session, ...rest } = v;
							return JSON.stringify(rest);
						})
						.join(', ')})`,
				);
			},
		);
	}

	const modelModules = [
		...listModules(['../*/*/*.model.js'], { cwd: __dirname }),
		...listModules(['src/*/*/*.model.js']),
	];
	const transformOption: ToObjectOptions = {
		virtuals: true,
		versionKey: false,
		transform: function (doc: unknown, ret: Record<string, unknown>) {
			delete ret._id;
			return ret;
		},
	};

	for (const modelModule of modelModules) {
		let model = opts[modelModule.name] as ModelClass;
		const custom = {
			author: false,
			paranoid: false,
			middleware: true,
		};

		if (model.timestamps !== false) model.schema.set('timestamps', true);

		if (model.author !== false) {
			custom.author = true;
			model.schema.add({
				createdBy: { id: String, username: String },
				updatedBy: { id: String, username: String },
			});
		}

		if (model.paranoid !== false) {
			custom.paranoid = true;
			model.schema.add({ deletedAt: Date, deletedBy: { id: String, username: String } });
		}

		for (const index of model.compoundIndexes ?? []) {
			model.schema.index(index);
		}

		model.schema.virtual('id').get(function () {
			return (this._id as mongoose.Types.ObjectId).toHexString();
		});

		model.schema.set('toJSON', transformOption);
		model.schema.set('toObject', transformOption);
		model.schema.set('custom', custom);

		model = initMiddleware(model);

		mongodb.model(model.modelName, model.schema);
	}
	console.log('connected to database');

	await runMigrations(opts, mongodb);

	return mongodb;
};

export default { init };
