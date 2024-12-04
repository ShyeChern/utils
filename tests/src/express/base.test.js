const Joi = require('joi');
const { express, Logger, constants } = require('../../../lib');

class MockMulterError extends Error {
	constructor(code, field) {
		super(code);
		this.name = 'MulterError';
		this.code = code;
		this.field = field;
	}
}
const multer = () => ({
	any: () => {
		return (req, res, next) => {
			if (req.body.error) {
				const error = new MockMulterError(
					constants.file.MULTER_ERROR_CODE.FILE_SIZE,
					req.files[0].fieldname,
				);
				return next(error);
			}
			return next();
		};
	},
});

multer.diskStorage = jest.fn();
multer.MulterError = MockMulterError;
jest.mock('multer', () => {
	return multer;
});

Object.defineProperty(express.Base, 'name', {
	value: 'Base',
	writable: true,
});

describe('express/base', () => {
	const requestId = 'unitTest - Base';
	const logger = new Logger({ requestId });
	const Base = new express.Base({ req: { __: (v) => v }, logger });

	describe('getEntity', () => {
		test('should return entity name', () => {
			const entity = 'base';
			expect(Base.getEntity()).toBe(entity);
			Base.constructor.name = 'BaseService';
			expect(Base.getEntity()).toBe(entity);
			Base.constructor.name = 'BaseController';
			expect(Base.getEntity()).toBe(entity);
			Base.constructor.name = 'BaseRepository';
			expect(Base.getEntity()).toBe(entity);
		});
	});

	describe('validate', () => {
		const schema = Joi.object({
			addresses: Joi.array()
				.items(
					Joi.object({
						name: Joi.custom((value, helpers) => {
							const context = helpers.prefs.context;
							const parent = helpers.state.ancestors.pop();
							return helpers.message(context.t('user.notFound'));
						}),
					}),
				)
				.min(1),
		});
		test('should able to validate data', async () => {
			const newSchema = schema.keys({
				addresses: Joi.array()
					.items(
						Joi.object({
							name: Joi.custom((value, helpers) => {
								return value;
							}),
						}),
					)
					.min(1),
			});
			const data = { addresses: [{ name: 'My Address' }] };
			const result = await Base.validate(newSchema, data);
			expect(result.error).toBe(undefined);
			expect(JSON.stringify(result)).toBe(JSON.stringify(data));
		});

		test('should able to construct error', async () => {
			try {
				await Base.validate(schema, { addresses: [{ name: 'something' }] });
				throw new Error('error');
			} catch (error) {
				expect(error.code).toBe(constants.error.VALIDATION_ERROR);
				expect(error.statusCode).toBe(constants.app.BAD_REQUEST);
				expect(error.error['addresses.0.name'].length).toBe(1);
				expect(error.error['addresses.0.name'][0].message).toBe('user.notFound');
			}
		});
	});

	describe('validateFile', () => {
		const req = {
			body: { data: 'data' },
			files: [
				{
					fieldname: 'profileImage',
					originalname: 'profile_image.png',
					encoding: '7bit',
					mimetype: 'image/png',
					destination: 'uploads/profile-images/',
					filename: 'profile_image_160708218520241204135320.png',
					path: 'uploads/profile-images/profile_image_160708218520241204135320.png',
					size: 2069,
				},
			],
		};
		test('should able to validate file', async () => {
			const result = await Base.validateFile({ ...req }, {}, () => {});
			expect(result).toBe(true);
		});

		test('should able to throw file size exceed error', async () => {
			try {
				await Base.validateFile({ ...req, body: { error: true } }, {}, () => {});
				throw new Error('error');
			} catch (error) {
				expect(error.message).toBe('validation.fileLimitExceeded');
				expect(error.code).toBe(constants.file.MULTER_ERROR_CODE.FILE_SIZE);
				expect(error.statusCode).toBe(constants.app.BAD_REQUEST);
				expect(error.error.profileImage.length).toBe(1);
				expect(error.error.profileImage[0].message).toBe(
					constants.file.MULTER_ERROR_CODE.FILE_SIZE,
				);
			}
		});
	});
});
