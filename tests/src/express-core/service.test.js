const { expressCore, constants } = require('../../../lib');
const model = require('../../../lib/mongodb-core/audits/audits.model');

describe('express/service', () => {
	const service = new expressCore.ServiceBase({ req: { __: (v) => v } });
	const repository = new expressCore.RepositoryBase(model, {
		req: { __: (v) => v },
		mongodb: {
			models: {
				Audit: {},
			},
		},
	});
	repository.get = jest.fn().mockReturnValue(true);
	repository.paginate = jest.fn().mockReturnValue(true);
	repository.create = jest.fn().mockReturnValue([{ _id: 1 }]);
	repository.update = jest.fn().mockReturnValue(true);
	repository.delete = jest.fn().mockReturnValue(true);
	service.serviceBaseRepository = repository;

	describe('checkConcurrency', () => {
		test('should able to check concurrency', async () => {
			const time = new Date().toISOString();
			const prevValue = { updatedAt: time };
			const newValue = { updatedAt: time };
			service.checkConcurrency(prevValue, newValue);
			expect(newValue.updatedAt).toBe(undefined);
		});

		test('should able to throw concurrency error', async () => {
			try {
				const prevValue = { updatedAt: new Date().toISOString() };
				const newValue = { updatedAt: new Date(0).toISOString() };
				service.checkConcurrency(prevValue, newValue);
				throw new Error('error');
			} catch (error) {
				expect(error.message).toBe('validation.concurrency');
				expect(error.statusCode).toBe(constants.app.CONFLICT);
				expect(error.code).toBe(constants.error.CONFLICT);
			}
		});
	});

	describe('getRepository', () => {
		test('should able to get repository', async () => {
			const result = service.getRepository();
			expect(result).toBe(repository);
		});
	});

	describe('get', () => {
		test('should able to get', async () => {
			const result = await service.get({ id: 1 });
			expect(result).toBe(true);
		});

		test('should able to throw error if not found', async () => {
			try {
				repository.get = jest.fn().mockReturnValue(false);
				await service.get({ id: 1 });
			} catch (error) {
				expect(error.message).toBe('serviceBase.notFound');
				expect(error.statusCode).toBe(constants.app.NOT_FOUND);
			}
			repository.get = jest.fn().mockReturnValue(true);
		});
	});

	describe('getAll', () => {
		test('should able to get all', async () => {
			const result = await service.getAll({});
			expect(result).toBe(true);
		});
	});

	describe('create', () => {
		test('should able to create', async () => {
			const result = await service.create({});
			expect(result.id).toBe(1);
		});
	});

	describe('update', () => {
		test('should able to update', async () => {
			const id = 1;
			const result = await service.update(id, {});
			expect(result.id).toBe(id);
		});
	});

	describe('delete', () => {
		test('should able to delete', async () => {
			const id = 1;
			const result = await service.delete(id);
			expect(result.id).toBe(id);
		});
	});
});
