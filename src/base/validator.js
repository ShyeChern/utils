const Joi = require('joi');
const { file: fileConst } = require('../constants');

module.exports.pagination = Joi.object({
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
module.exports.file = file;

module.exports.pdf = Joi.object({
	mimetype: Joi.string().required().valid(fileConst.MIME_TYPE.PDF),
}).concat(file);

module.exports.excel = Joi.object({
	mimetype: Joi.string().required().valid(fileConst.MIME_TYPE.XLS, fileConst.MIME_TYPE.XLSX),
}).concat(file);

module.exports.image = Joi.object({
	mimetype: Joi.string().required().valid(fileConst.MIME_TYPE.JPEG, fileConst.MIME_TYPE.PNG),
}).concat(file);

module.exports.concurrency = Joi.object({
	updatedAt: Joi.date().required(),
});
