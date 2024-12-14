const routes = require('../../../lib/express/routes');
const { constants } = require('../../../lib');

jest.mock('awilix', () => {
	const originalModule = jest.requireActual('awilix');
	return {
		__esModule: true,
		...originalModule,
		listModules: (v) => {
			if (v[0] !== 'src/*/*/*.route.js') return originalModule.listModules(v);
			return [
				{
					name: 'users.route',
					path: '/usr/src/app/src/v1/users/users.route.js',
				},
			];
		},
	};
});

describe('express/route', () => {
	afterAll(() => {
		jest.unmock('awilix');
	});

	describe('route', () => {
		const middleware = { handler: jest.fn().mockReturnValue(true) };
		const route = class UserRoute {
			static routes = [
				{
					path: 'users',
					get: ['getAll'],
				},
				{
					path: 'users/:id',
					get: ['get'],
					patch: [middleware.handler, 'update'],
				},
			];
		};
		const app = routes({ 'users.route': route }, {});
		const req = {
			container: {
				cradle: {
					userController: {
						get: jest.fn().mockReturnValue(true),
						getAll: jest.fn().mockReturnValue(true),
						update: jest.fn().mockReturnValue(true),
					},
				},
			},
		};

		test('should able list routes with correct handler', async () => {
			const routerMiddleware = app._router.stack.at(-2);
			expect(routerMiddleware.handle.stack.length).toBe(3);
		});

		test('should able execute route handler', async () => {
			const routerMiddleware = app._router.stack.at(-2);
			const updateFunc = routerMiddleware.handle.stack.at(-1);
			const spyMiddlewareFunc = jest.spyOn(middleware, 'handler');
			const spyUpdateFunc = jest.spyOn(req.container.cradle.userController, 'update');
			updateFunc.route.stack[0].handle();
			updateFunc.route.stack[1].handle(req, {}, () => {});
			expect(spyMiddlewareFunc).toHaveBeenCalled();
			expect(spyUpdateFunc).toHaveBeenCalled();
			spyMiddlewareFunc.mockRestore();
			spyUpdateFunc.mockRestore();
		});

		test('should able show not found if path is not found', async () => {
			const notFoundMiddleware = app._router.stack.at(-1);
			let result;
			notFoundMiddleware.handle(
				{},
				{
					status: (v) => {
						result = v === constants.app.NOT_FOUND;
						return result ? { send: jest.fn().mockReturnValue(true) } : false;
					},
				},
			);
			expect(result).toBe(true);
		});
	});
});
