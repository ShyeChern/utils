const { Logger } = require('../../lib');

describe('utils/logger', () => {
	const requestId = 'unitTest';
	const logger = new Logger({ requestId });
	let spyFunc;
	const infoOne = 'unit test one';
	const infoTwo = 'unit test two';

	beforeAll(() => {
		spyFunc = jest.spyOn(console, 'info');
	});

	test('should generate console info', () => {
		logger.info(infoOne, infoTwo);
		expect(spyFunc).toHaveBeenCalled();
	});

	test('should generate correct info', () => {
		const output = spyFunc.mock.calls[0];
		expect(new Date(output[0])).toBeInstanceOf(Date);
		expect(output[1]).toBe(requestId);
		expect(output[2]).toBe(infoOne);
		expect(output[3]).toBe(infoTwo);
	});

	afterAll(() => {
		spyFunc.mockRestore();
	});
});
