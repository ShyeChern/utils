const { parse, isDate } = require('date-fns');
const { express } = require('../../../lib');

describe('express/container', () => {
	const container = express.container;

	describe('init', () => {
		test('should able to init application', async () => {
			expect(container.hasRegistration('init')).toBe(true);
		});
	});

	describe('createScope', () => {
		test('should able to create scope with extra params', async () => {
			const scope = await container.cradle.createScope();
			const extraParams = { params1: 1, params2: 1, params3: 1 };
			const result = await container.cradle.createScope({}, extraParams);
			expect(Object.keys(result.registrations).length).toBe(
				Object.keys(scope.registrations).length + Object.keys(extraParams).length,
			);
		});

		test('should able to create scope with requestId', async () => {
			const scope = await container.cradle.createScope();
			const data = scope.cradle.requestId.split('');
			const date = parse(
				scope.cradle.requestId,
				`yy${data[2]}MM${data[5]}dd${data[8]}HH${data[11]}mm${data[14]}ss${data[17]}`,
				new Date(),
			);
			expect(isDate(date)).toBe(true);
		});
	});
	describe('logger', () => {
		test('should able to log', () => {
			expect(container.hasRegistration('logger')).toBe(true);
		});
	});
});
