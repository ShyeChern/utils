const middlewares = require('../../../../lib/express/middlewares');
const { constants, security } = require('../../../../lib');

describe('express/middlewares', () => {
	describe('auth', () => {
		const authMiddleware = middlewares.auth({
			whitelistUrl: { 'api/login': true },
		});
		const req = {
			headers: {},
			originalUrl: 'api/login',
			__: (v) => v,
			container: {
				cradle: {
					userRepository: { verifyUser: (v) => v },
					cache: { get: () => ({ ADMIN: {} }) },
					logger: { info: (v) => v },
				},
				register: (v) => v,
			},
		};
		test('should able to skip whitelisted url', async () => {
			const result = await authMiddleware(req, {}, (v) => v);
			expect(result).toBe(undefined);
		});

		test('should able to throw error if no authenication token', async () => {
			req.originalUrl = 'api/users';
			const result = await authMiddleware(req, {}, (v) => v);
			expect(result.message).toBe('error.unauthorized');
			expect(result.statusCode).toBe(constants.app.UNAUTHORIZED);
		});

		test('should able to verify authenication token', async () => {
			const id = 1;
			const role = 'ADMIN';
			const token = security.generateToken({ id, role }, {});
			req.headers.authorization = `Bearer ${token}`;
			const result = await authMiddleware(req, {}, (v) => v);
			expect(result).toBe(undefined);
			expect(req.container.cradle.userRepository.currentUser.id).toBe(id);
			expect(req.container.cradle.userRepository.currentUser.role).toBe(role);
			expect(JSON.stringify(req.container.cradle.userRepository.currentUser.access)).toBe(
				JSON.stringify({}),
			);
		});

		test('should able to throw error with code if token expired', async () => {
			const token = security.generateToken({}, { expiresIn: 1 });
			await new Promise((resolve) => setTimeout(resolve, 1000));
			req.headers.authorization = `Bearer ${token}`;
			const result = await authMiddleware(req, {}, (v) => v);
			expect(result.code).toBe(constants.error.TOKEN_EXPIRED);
		});
	});
});
