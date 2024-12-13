const Joi = require('Joi');
const { express, constants, validator } = require('../../../lib');

describe('express/controller', () => {
	const controller = new express.ControllerBase({ req: { __: (v) => v } });
	const service = new express.ServiceBase({ req: { __: (v) => v } });
	service.getAll = jest.fn().mockReturnValue(true);
	service.get = jest.fn().mockReturnValue(true);
	service.create = jest.fn().mockReturnValue(true);
	service.update = jest.fn().mockReturnValue(true);
	service.delete = jest.fn().mockReturnValue(true);
	const mockValidator = {
		create: Joi.object({}),
		update: Joi.object({}),
		concurrency: validator.concurrency,
	};
	controller.controllerBaseService = service;
	controller.controllerBaseValidator = mockValidator;

	describe('checkAccess', () => {
		test('should able to checkAccess', async () => {
			const result = await controller.checkAccess();
			expect(result).toBe(undefined);
		});
	});

	describe('getService', () => {
		test('should able to get service', async () => {
			const result = controller.getService();
			expect(result).toBe(service);
		});
	});

	describe('getValidator', () => {
		test('should able to get validator', async () => {
			const result = controller.getValidator();
			expect(result).toBe(mockValidator);
		});
	});

	describe('getAll', () => {
		test('should able to getAll', async () => {
			const result = await controller.getAll(
				{},
				{ send: jest.fn().mockReturnValue(true) },
				(v) => v,
			);
			expect(result).toBe(true);
		});
	});

	describe('get', () => {
		test('should able to get', async () => {
			const result = await controller.get({}, { send: jest.fn().mockReturnValue(true) }, (v) => v);
			expect(result).toBe(true);
		});
	});

	describe('create', () => {
		test('should able to create', async () => {
			const result = await controller.create(
				{},
				{
					status: (v) =>
						v === constants.app.CREATED ? { send: jest.fn().mockReturnValue(true) } : false,
				},
				(v) => v,
			);
			expect(result).toBe(true);
		});
	});

	describe('update', () => {
		test('should able to update', async () => {
			const result = await controller.update(
				{ params: { id: 1 }, body: { updatedAt: new Date().toISOString() } },
				{
					send: jest.fn().mockReturnValue(true),
				},
				(v) => v,
			);
			expect(result).toBe(true);
		});
	});

	describe('delete', () => {
		test('should able to delete', async () => {
			const result = await controller.delete(
				{ params: { id: 1 } },
				{ send: jest.fn().mockReturnValue(true) },
				(v) => v,
			);
			expect(result).toBe(true);
		});
	});
});
