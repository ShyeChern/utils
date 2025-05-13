import mongoose from 'mongoose';
import auditModel from './audits/audits.model';
import { ModelClass } from 'mongodb-core';

const QUERY: { pre: mongoose.PreMiddlewareFunction; post: mongoose.PostMiddlewareFunction } = {
	pre: async function (next) {
		const custom = this.schema.get('custom');
		const options = this.options;

		if (options.middleware === false) return next();

		const filter = this.getFilter();
		if (custom.paranoid && filter) {
			this.getFilter().deletedAt = null;
		}

		const update = this.getUpdate();
		if (custom.author && update && !options.isDelete) {
			if (!options.currentUser) throw new Error('currentUser is not provided for audit');
			const author = {
				id: options.currentUser.id,
				username: options.currentUser.username,
			};
			update.updatedBy = author;
			update.$setOnInsert.createdBy = author;
		}

		if (update || options.isDelete) {
			this.prevValues = await this.model.find(filter, {}, { lean: true, middleware: false });
		}

		return next();
	},
	post: function (result, next) {
		const options = this.options;

		if (options.middleware === false) return next();

		if (options.isDelete) options.auditService.deleteLog(this, this.prevValues);
		else options.auditService.updateLog(this, this.prevValues);
		return next();
	},
};

const DOCUMENT: { pre: mongoose.PreSaveMiddlewareFunction; post: mongoose.PostMiddlewareFunction } =
	{
		pre: function (next) {
			const custom = this.constructor.schema.get('custom');
			const options = this.$__.saveOptions;

			if (options.middleware === false) return next();

			if (custom.author) {
				if (!options.currentUser) throw new Error('currentUser is not provided for audit');
				const author = {
					id: options.currentUser.id,
					username: options.currentUser.username,
				};
				this.updatedBy = author;
				this.createdBy = author;
			}
			return next();
		},
		post: function (doc, next) {
			const options = this.$__.saveOptions;

			if (options.middleware === false) return next();
			if (this.constructor.modelName === auditModel.modelName) return next();

			options.auditService.createLog(doc, options);

			return next();
		},
	};

const AGGREGATE: { pre: mongoose.PreMiddlewareFunction } = {
	pre: function (next) {
		const custom = this._model.schema.get('custom');
		const options = this.options;

		if (options.middleware === false) return next();

		if (custom.paranoid) {
			this.pipeline().unshift({ $match: { deletedAt: { $eq: null } } });
		}
		return next();
	},
};

const MODEL: {
	pre: (
		this: mongoose.Model<unknown>,
		next: (err?: mongoose.CallbackError) => void,
		docs: any | Array<any>,
		options: any,
	) => void | Promise<void>;
	post: mongoose.PostMiddlewareFunction;
} = {
	pre: function (next, data, options) {
		if (options.middleware === false) return next();

		const custom = this.schema.get('custom');
		if (custom.author) {
			if (!options.currentUser) throw new Error('currentUser is not provided for audit');
			const author = {
				id: options.currentUser.id,
				username: options.currentUser.username,
			};

			for (const value of data) {
				value.updatedBy = author;
				value.createdBy = author;
			}
		}
		return next();
	},
	post: function (data, next) {
		if (this.options.middleware === false) return next();
		this.options.auditService.createLog(data, this.options);
		return next();
	},
};

export const initMiddleware = (model: ModelClass) => {
	const schema = model.schema;
	schema.pre(/^find/, QUERY.pre);
	schema.pre(/^update/, QUERY.pre);
	schema.post(/^update/, QUERY.post);
	schema.pre(/^delete/, QUERY.pre);
	schema.post(/^delete/, QUERY.post);

	schema.pre('save', DOCUMENT.pre);
	schema.post('save', DOCUMENT.post);
	schema.pre('insertMany', MODEL.pre);
	schema.post('insertMany', MODEL.post);

	schema.pre('aggregate', AGGREGATE.pre);

	return model;
};
