import Joi from 'joi';
import { file as fileConst } from '../constants';

const pagination = Joi.object({
	limit: Joi.number().min(0).default(10),
	page: Joi.number().min(1).default(1),
	sorts: Joi.array().items(
		Joi.string()
			.pattern(/^(.*),(1|-1)$/)
			.required(),
	),
});

const file = Joi.object({
	destination: Joi.string().required(),
	filename: Joi.string().required(),
	path: Joi.string().required(),
});

const pdf = Joi.object({
	mimetype: Joi.string().required().valid(fileConst.MIME_TYPE.PDF),
}).concat(file);

const excel = Joi.object({
	mimetype: Joi.string().required().valid(fileConst.MIME_TYPE.XLS, fileConst.MIME_TYPE.XLSX),
}).concat(file);

const image = Joi.object({
	mimetype: Joi.string().required().valid(fileConst.MIME_TYPE.JPEG, fileConst.MIME_TYPE.PNG),
}).concat(file);

const concurrency = Joi.object({
	updatedAt: Joi.date().required(),
});

export { pagination, file, pdf, excel, image, concurrency };
