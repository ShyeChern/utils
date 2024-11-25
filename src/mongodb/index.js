const mongoose = require('mongoose');
const { listModules } = require('awilix');
const { initMiddleware } = require('./middlewares');
const { runMigrations } = require('./migrations');

module.exports.init = async (opts) => {
	const mongodb = await mongoose.createConnection(process.env.MONGODB_URL).asPromise();

	if (process.env.NODE_ENV !== 'production') {
		mongoose.set('debug', function (collectionName, methodName, ...methodArgs) {
			console.log(
				`Mongoose: ${collectionName}.${methodName}(${methodArgs
					.map((v) => {
						const { auditService, session, ...rest } = v;
						return JSON.stringify(rest);
					})
					.join(', ')})`,
			);
		});
	}

	const modelModules = [
		...listModules(['../*/*/*.model.js'], { cwd: __dirname }),
		...listModules(['src/*/*/*.model.js']),
	];
	const transformOption = {
		virtuals: true,
		versionKey: false,
		transform: function (doc, ret) {
			delete ret._id;
			return ret;
		},
	};

	for (const modelModule of modelModules) {
		let model = opts[modelModule.name];
		const custom = {
			author: false,
			paranoid: false,
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
			return this._id.toHexString();
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
