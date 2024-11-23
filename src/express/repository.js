const Base = require('./base');

module.exports = class RepositoryBase extends Base {
	constructor(model, opts) {
		super(opts);
		this.model = opts.mongodb.models[model.modelName];
		this.mongodb = this.model.db;
		if (this.constructor.name !== 'AuditRepository') this.auditService = opts.auditService;
	}

	getDefaultOption(options) {
		return {
			currentUser: this.currentUser,
			auditService: this.auditService,
			...options,
		};
	}

	transformData(data) {
		if (Array.isArray(data)) {
			data = data.map((v) => this.transformData(v));
		}

		if (data?.constructor?.name === 'model' && data.toJSON) {
			data = data.toJSON();
		}
		return data;
	}

	async getAll(filter, projection, options = {}) {
		options = this.getDefaultOption(options);
		const result = await this.model.find(filter, projection, options);
		return this.transformData(result);
	}

	async get(filter, projection, options = {}) {
		options = this.getDefaultOption(options);
		const result = await this.model.findOne(filter, projection, options);
		return this.transformData(result);
	}

	async count(filter, options = {}) {
		options = this.getDefaultOption({ ...options, limit: undefined, skip: undefined });
		const result = await this.model.countDocuments(filter, options);
		return result;
	}

	async paginate(filter, projection, options = {}) {
		options.skip = (options.page - 1) * options.limit;
		options.sort = options.sorts?.reduce((acc, cur) => {
			const [field, order] = cur.split(',');
			acc[field] = +order;
			return acc;
		}, {}) ?? { _id: -1 };
		const [data, count] = await Promise.all([
			this.getAll(filter, projection, options),
			this.count(filter, options),
		]);
		return { data, count, totalPage: Math.ceil(count / options.limit) };
	}

	async aggregate(pipelines, options = {}) {
		options = this.getDefaultOption(options);
		if (options.id !== false) {
			pipelines.push({ $addFields: { id: '$_id' } }, { $project: { _id: 0, __v: 0 } });
		}
		const result = await this.model.aggregate(pipelines, options);
		return result;
	}

	/**
	 * TODO: add custom options
	 * @param {Array|Object} data
	 * @param {import('mongoose').CreateOptions&import('mongoose').InsertManyOptions} options
	 */
	async create(data, options = {}) {
		options = this.getDefaultOption(options);
		const result = await (Array.isArray(data)
			? this.model.insertMany(data, options)
			: this.model.create([data], options));

		return result;
	}

	async update(filter, data, options = {}) {
		if (Object.keys(filter).length === 0 && !options.force) {
			throw new Error('Please specify update filter');
		}

		options = this.getDefaultOption(options);
		const result = await this.model.updateMany(filter, data, options);
		return result;
	}

	async delete(filter, options = {}) {
		if (Object.keys(filter).length === 0 && !options.force) {
			throw new Error('Please specify delete filter');
		}

		const paranoid = this.model.schema.options.custom.paranoid;
		options = this.getDefaultOption(options);
		options.isDelete = true;
		let result;
		if (paranoid) {
			options.timestamps = false;
			result = await this.update(
				filter,
				{
					deletedAt: new Date().toISOString(),
					deletedBy: {
						id: this.currentUser.id,
						username: this.currentUser.username,
					},
				},
				options,
			);
		} else result = await this.model.deleteMany(filter, options);
		return result;
	}
};
