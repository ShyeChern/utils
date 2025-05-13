import { Base, type BaseOption } from './base';
import { User } from '../types/user';
import { type ServiceBaseGetAll } from './';
// TODO: audit service ts
// import { AuditService } from '../mongodb/audits/audits.service';
import mongoose from 'mongoose';
import * as mdb from 'mongodb';

export interface RepositoryBaseSetOption {
	currentUser: User;
	// TODO: audit service ts
	// auditService: this.auditService,
}

export interface RepositoryBaseAggregateOption extends mongoose.AggregateOptions {
	/** add id field and remove _id and __v. Default: true */
	id?: boolean;
}

export interface RepositoryBaseCountOption
	extends mdb.CountOptions,
		mongoose.MongooseBaseQueryOptions {}

export interface RepositoryBaseUpdateOption
	extends mdb.UpdateOptions,
		mongoose.MongooseUpdateQueryOptions {
	/** force update to whole collection when filter is empty. Default: false */
	force?: boolean;
}

export interface RepositoryBaseDeleteOption
	extends mdb.DeleteOptions,
		mongoose.MongooseBaseQueryOptions {
	/** force delete to whole collection when filter is empty. Default: false */
	force?: boolean;
}

export class RepositoryBase extends Base {
	model;
	mongodb;
	auditService;

	constructor(model: mongoose.Model<unknown>, opts: BaseOption) {
		super(opts);
		this.model = opts.mongodb.models[model.modelName];
		this.mongodb = this.model.db;
		// TODO: audit service ts
		if (this.constructor.name !== 'AuditRepository') this.auditService = opts.auditService;
	}

	setOption<T>(options: T): RepositoryBaseSetOption & T {
		return {
			currentUser: this.currentUser,
			auditService: this.auditService,
			...options,
		};
	}

	transformData(
		data: unknown | unknown[],
	): Record<string, unknown>[] | Record<string, unknown> | unknown {
		if (Array.isArray(data)) {
			data = data.map((v) => this.transformData(v));
		}

		if (data?.constructor?.name === 'model' && data instanceof mongoose.Document && data.toJSON) {
			data = data.toJSON();
		}
		return data;
	}

	async getAll(
		filter: mongoose.RootFilterQuery<unknown>,
		projection?: mongoose.ProjectionType<unknown>,
		options: mongoose.QueryOptions = {},
	) {
		const mergedOption = this.setOption(options);
		const result = await this.model.find(filter, projection, mergedOption);
		return this.transformData(result);
	}

	async get(
		filter?: mongoose.RootFilterQuery<unknown>,
		projection?: mongoose.ProjectionType<unknown>,
		options: mongoose.QueryOptions = {},
	) {
		const mergedOption = this.setOption(options);
		const result = await this.model.findOne(filter, projection, mergedOption);
		return this.transformData(result);
	}

	async count(filter?: mongoose.RootFilterQuery<unknown>, options: RepositoryBaseCountOption = {}) {
		const mergedOption = this.setOption({ ...options, limit: undefined, skip: undefined });
		const result = await this.model.countDocuments(filter, mergedOption);
		return result;
	}

	async paginate(
		filter: mongoose.RootFilterQuery<unknown>,
		projection?: mongoose.ProjectionType<unknown>,
		options: ServiceBaseGetAll & mongoose.QueryOptions & RepositoryBaseCountOption = {},
	) {
		const limit = options.limit ?? 10;
		const page = options.page ?? 1;
		options.skip = (page - 1) * limit;
		options.sort = options.sorts?.reduce(
			(acc, cur) => {
				const [field, order] = cur.split(',');
				acc[field] = +order;
				return acc;
			},
			{} as Record<string, unknown>,
		) ?? { _id: -1 };
		const [data, count] = await Promise.all([
			this.getAll(filter, projection, options),
			this.count(filter, options),
		]);
		return { data, count, totalPage: Math.ceil(count / limit) };
	}

	async aggregate(
		pipelines: mongoose.PipelineStage[],
		options: RepositoryBaseAggregateOption = {},
	) {
		const mergedOption = this.setOption(options);
		if (mergedOption.id !== false) {
			pipelines.push({ $addFields: { id: '$_id' } }, { $project: { _id: 0, __v: 0 } });
		}
		const result = await this.model.aggregate(pipelines, mergedOption);
		return result;
	}

	async create(
		data: Array<Record<string, unknown>> | Record<string, unknown>,
		options: mongoose.InsertManyOptions & mongoose.CreateOptions = {},
	) {
		const mergedOption = this.setOption(options);
		const result = await (Array.isArray(data)
			? this.model.insertMany(data, mergedOption)
			: this.model.create([data], mergedOption));

		return result;
	}

	async update(
		filter: mongoose.RootFilterQuery<unknown>,
		data: mongoose.UpdateQuery<unknown> | mongoose.UpdateWithAggregationPipeline,
		options: RepositoryBaseUpdateOption = {},
	) {
		if (Object.keys(filter).length === 0 && !options.force) {
			throw new Error('Please specify update filter');
		}

		const mergedOption = this.setOption(options);
		const result = await this.model.updateMany(filter, data, mergedOption);
		return result;
	}

	async delete(filter: mongoose.RootFilterQuery<any>, options: RepositoryBaseDeleteOption = {}) {
		if (Object.keys(filter).length === 0 && !options.force) {
			throw new Error('Please specify delete filter');
		}

		const paranoid = this.model.schema.get('custom').paranoid;
		const mergedOption = this.setOption(options);
		mergedOption.isDelete = true;
		let result;
		if (paranoid) {
			mergedOption.timestamps = false;
			result = await this.update(
				filter,
				{
					deletedAt: new Date().toISOString(),
					deletedBy: {
						id: this.currentUser.id,
						username: this.currentUser.username,
					},
				},
				mergedOption,
			);
		} else result = await this.model.deleteMany(filter, mergedOption);
		return result;
	}
}
