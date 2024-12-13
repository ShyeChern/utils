const { express } = require('../../../lib');
const model = require('../../../lib/mongodb/audits/audits.model');

describe('express/repository', () => {
	const repository = new express.RepositoryBase(model, {
		req: { __: (v) => v },
		mongodb: {
			models: {
				Audit: {
					db: {},
					find: (...v) => ({ ...v }),
					findOne: (...v) => ({ ...v }),
					countDocuments: (...v) => ({ ...v }),
					aggregate: (...v) => ({ ...v }),
					insertMany: (...v) => ({ ...v }),
					create: (...v) => ({ ...v }),
					updateMany: (...v) => ({ ...v }),
					deleteMany: (...v) => ({ ...v }),
					schema: {
						options: {
							custom: { paranoid: true },
						},
					},
				},
			},
		},
		auditService: {},
		currentUser: { id: 1, username: 'username' },
	});

	describe('getDefaultOption', () => {
		test('should able to get and overwrite default option', async () => {
			const overwriteUser = 'currentUser';
			const result = repository.getDefaultOption({ currentUser: overwriteUser });
			expect(result.currentUser).toBe(overwriteUser);
		});
	});

	describe('transformData', () => {
		const transformedData = 'transformed';
		const data = {
			constructor: { name: 'model' },
			toJSON: () => 'transformed',
		};
		test('should able to transform object data', async () => {
			const result = repository.transformData(data);
			expect(result).toBe(transformedData);
		});

		test('should able to transform array data', async () => {
			const result = repository.transformData([data, data, data]);
			expect(result.every((v) => v === transformedData)).toBe(true);
		});
	});

	describe('getAll', () => {
		test('should able to get all data', async () => {
			const result = await repository.getAll();
			expect(Object.keys(result).length).toBe(3);
		});
	});

	describe('get', () => {
		test('should able to get data', async () => {
			const result = await repository.get();
			expect(Object.keys(result).length).toBe(3);
		});
	});

	describe('count', () => {
		test('should able to count all data', async () => {
			const result = await repository.count();
			expect(Object.keys(result).length).toBe(2);
		});

		test('should able to ignore limit and skip option', async () => {
			const result = await repository.count({}, { limit: 1, skip: 1 });
			expect(result[1].limit).toBe(undefined);
			expect(result[1].skip).toBe(undefined);
		});
	});

	describe('paginate', () => {
		test('should able to get paginate data', async () => {
			const totalCount = 45;
			const totalPage = 5;
			const skip = 20;
			repository.model.countDocuments = async () => 45;
			const result = await repository.paginate(
				{},
				{},
				{ page: 3, limit: 10, sorts: ['id,-1', 'name,1'] },
			);
			expect(result.count).toBe(totalCount);
			expect(result.totalPage).toBe(totalPage);
			expect(result.data[2].skip).toBe(skip);
			expect(result.data[2].sort.id).toBe(-1);
			expect(result.data[2].sort.name).toBe(1);
		});

		test('should able to sort _id in descending by default', async () => {
			repository.model.countDocuments = async () => 45;
			const result = await repository.paginate({}, {}, { page: 3, limit: 10 });
			expect(result.data[2].sort._id).toBe(-1);
		});
	});

	describe('aggregate', () => {
		test('should able to aggregate data', async () => {
			const result = await repository.aggregate([]);
			expect(result[0].length).toBe(2);
		});

		test('should able to remove default pipeline', async () => {
			const result = await repository.aggregate([], { id: false });
			expect(result[0].length).toBe(0);
		});
	});

	describe('create', () => {
		const data = {
			name: '123',
		};
		test('should able to receive object data', async () => {
			const spyFunc = jest.spyOn(repository.model, 'create');
			const result = await repository.create(data);
			expect(result[0].length).toBe(1);
			expect(spyFunc).toHaveBeenCalled();
			spyFunc.mockRestore();
		});

		test('should able to receive array data', async () => {
			const spyFunc = jest.spyOn(repository.model, 'insertMany');
			const result = await repository.create([data, data, data]);
			expect(result[0].length).toBe(3);
			expect(spyFunc).toHaveBeenCalled();
			spyFunc.mockRestore();
		});
	});

	describe('update', () => {
		test('should able to update data', async () => {
			const filter = { id: 1 };
			const data = { name: 'new name' };
			const result = await repository.update(filter, data);
			expect(result[0]).toBe(filter);
			expect(result[1]).toBe(data);
		});

		test('should able to throw error if not specify filter', async () => {
			try {
				await repository.update({});
				throw new Error('error');
			} catch (error) {
				expect(error.message).toBe('Please specify update filter');
			}
		});

		test('should able to update all if pass force options', async () => {
			const filter = {};
			const data = {};
			const result = await repository.update({}, {}, { force: true });
			expect(result[0]).toStrictEqual(filter);
			expect(result[1]).toStrictEqual(data);
		});
	});

	describe('delete', () => {
		test('should able to soft delete data', async () => {
			const spyFunc = jest.spyOn(repository.model, 'updateMany');
			const filter = { id: 1 };
			const result = await repository.delete(filter);
			expect(result[0]).toBe(filter);
			expect(result[1].deletedAt).toBeTruthy();
			expect(result[1].deletedBy).toBeTruthy();
			expect(result[2].isDelete).toBe(true);
			expect(result[2].timestamps).toBe(false);
			expect(spyFunc).toHaveBeenCalled();
			spyFunc.mockRestore();
		});

		test('should able to hard delete data', async () => {
			const spyFunc = jest.spyOn(repository.model, 'deleteMany');
			repository.model.schema.options.custom.paranoid = false;
			const filter = { id: 1 };
			const result = await repository.delete(filter);
			expect(result[0]).toBe(filter);
			expect(result[1].isDelete).toBe(true);
			expect(spyFunc).toHaveBeenCalled();
			spyFunc.mockRestore();
		});

		test('should able to throw error if not specify filter', async () => {
			try {
				await repository.delete({});
				throw new Error('error');
			} catch (error) {
				expect(error.message).toBe('Please specify delete filter');
			}
		});

		test('should able to update all if pass force options', async () => {
			const filter = {};
			const result = await repository.delete({}, { force: true });
			expect(result[0]).toStrictEqual(filter);
		});
	});
});
