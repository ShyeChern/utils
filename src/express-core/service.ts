import { app, error } from '../constants';
import { BaseError } from '../base';
import { Base, type BaseOption, RepositoryBase } from './';

export interface ServiceBaseGet {
	id: string;
	[key: string]: unknown;
}

export interface ServiceBaseGetAll {
	limit?: number;
	page?: number;
	sorts?: Array<`${string},1` | `${string},-1`>;
	[key: string]: unknown;
}

export class ServiceBase extends Base {
	constructor(opts: BaseOption) {
		super(opts);
	}

	checkConcurrency(prevValue: Record<string, unknown>, newValue: Record<string, unknown>) {
		if (!prevValue.updatedAt || !newValue.updatedAt) return;

		const prevUpdatedAt = prevValue.updatedAt as string | number | Date;
		const newUpdatedAt = newValue.updatedAt as string | number | Date;

		if (new Date(prevUpdatedAt).getTime() > new Date(newUpdatedAt).getTime()) {
			throw new BaseError(this.t('validation.concurrency'), {
				statusCode: app.CONFLICT,
				code: error.CONFLICT,
			});
		}

		delete newValue.updatedAt;
	}

	getRepository<T extends RepositoryBase>(): T {
		const repositoryName = `${this.getEntity()}Repository` as keyof this;
		return this[repositoryName] as T;
	}

	async get(params: ServiceBaseGet) {
		const filter = {
			_id: params.id,
		};
		const data = await this.getRepository().get(filter);
		if (!data) throw new BaseError(this.t(`${this.getEntity()}.notFound`), app.NOT_FOUND);
		return data;
	}

	async getAll(query: ServiceBaseGetAll) {
		const { limit, page, sorts, ...rest } = query;
		const filter = rest;
		const result = await this.getRepository().paginate(filter, {}, { limit, page, sorts });
		return result;
	}

	async create(data: Record<string, unknown>) {
		const result = await this.getRepository().create(data);
		return { id: result[0]._id };
	}

	async update(id: string, data: Record<string, unknown>) {
		const value = (await this.get({ id })) as Record<string, unknown>;
		this.checkConcurrency(value, data);
		await this.getRepository().update({ _id: id }, data);
		return { id };
	}

	async delete(id: string) {
		await this.get({ id });
		await this.getRepository().delete({ _id: id });
		return { id };
	}
}
