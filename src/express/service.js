const { app, error } = require('../constants');
const { BaseError } = require('../base');
const Base = require('./base');

module.exports = class ServiceBase extends Base {
	constructor(opts) {
		super(opts);
	}

	checkConcurrency(prevValue, newValue) {
		if (new Date(prevValue.updatedAt).getTime() > new Date(newValue.updatedAt).getTime()) {
			throw new BaseError(this.t('validation.concurrency'), {
				statusCode: app.CONFLICT,
				code: error.CONFLICT,
			});
		}
		delete newValue.updatedAt;
	}

	getRepository() {
		return this[`${this.getEntity()}Repository`];
	}

	async get(params) {
		const filter = {
			_id: params.id,
		};
		const data = await this.getRepository().get(filter);
		if (!data) throw new BaseError(this.t(`${this.getEntity()}.notFound`), app.NOT_FOUND);
		return data;
	}

	async getAll(query) {
		const { limit, page, sorts, ...rest } = query;
		const filter = rest;
		const result = await this.getRepository().paginate(
			filter,
			{},
			{ limit: query.limit, page: query.page, sorts: query.sorts },
		);
		return result;
	}

	async create(data) {
		const result = await this.getRepository().create(data);
		return { id: result[0]._id };
	}

	async update(id, data) {
		const value = await this.get({ id });
		this.checkConcurrency(value, data);
		await this.getRepository().update({ _id: id }, data);
		return { id };
	}

	async delete(id) {
		await this.get({ id });
		await this.getRepository().delete({ _id: id });
		return { id };
	}
};
