import { app } from '../constants';
import { validator } from '../base';
import { Base, type BaseOption, ServiceBase, type ServiceBaseGet } from './';
import express from 'express';
import Joi from 'joi';

export interface ValidatorBase {
	[key: string]: Joi.Schema;
}

export class ControllerBase extends Base {
	constructor(opts: BaseOption) {
		super(opts);
	}

	async checkAccess() {
		// TODO: check access func
	}

	getService<T extends ServiceBase>(): T {
		const serviceName = `${this.getEntity()}Service` as keyof this;
		return this[serviceName] as T;
	}

	getValidator<T extends ValidatorBase>(): T {
		const validatorName = `${this.getEntity()}Validator` as keyof this;
		return this[validatorName] as T;
	}

	async getAll(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const schema = this.getValidator().getAll ?? validator.pagination;
			const data = await super.validate(schema, req.query);
			const result = await this.getService().getAll(data);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}

	async get(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const result = await this.getService().get(req.params as ServiceBaseGet);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}

	async create(req: express.Request, res: express.Response, next: express.NextFunction) {
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

	async update(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			let schema = this.getValidator().update as Joi.ObjectSchema;
			if (!schema) throw new Error('update schema is not defined');
			schema = schema.concat(validator.concurrency);
			const data = await super.validate(schema, req.body);
			const result = await this.getService().update(req.params.id, data);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}

	async delete(req: express.Request, res: express.Response, next: express.NextFunction) {
		try {
			const result = await this.getService().delete(req.params.id);
			return res.send(result);
		} catch (error) {
			next(error);
		}
	}
}
