const { app } = require('../constants');
const Base = require('./base');
const validator = require('../base/validator');

module.exports = class ControllerBase extends Base {
	constructor(opts) {
		super(opts);
	}

	async checkAccess() {
		// TODO: check access func
	}

	getService() {
		return this[`${this.getEntity()}Service`];
	}

	getValidator() {
		return this[`${this.getEntity()}Validator`];
	}

	async getAll(req, res, next) {
		try {
			const schema = this.getValidator().getAll ?? validator.pagination;
			const data = await super.validate(schema, req.query);
			const result = await this.getService().getAll(data);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}

	async get(req, res, next) {
		try {
			const result = await this.getService().get(req.params);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}

	async create(req, res, next) {
		try {
			const schema = this.getValidator().create;
			if (!schema) throw new Error('create schema is not defined');
			const data = await super.validate(schema, req.body);
			const result = await this.getService().create(data);
			return res.status(app.CREATED).send(result);
		} catch (error) {
			next(error);
		}
	}

	async update(req, res, next) {
		try {
			let schema = this.getValidator().update;
			if (!schema) throw new Error('update schema is not defined');
			schema = schema.concat(validator.concurrency);
			const data = await super.validate(schema, req.body);
			const result = await this.getService().update(req.params.id, data);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}

	async delete(req, res, next) {
		try {
			const result = await this.getService().delete(req.params.id);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}
};
