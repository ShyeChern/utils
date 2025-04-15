const middlewares = require('../../../../lib/express/middlewares');
const { constants, security } = require('../../../../lib');

describe('express/middlewares', () => {
	describe('cipher', () => {
		const req = {
			headers: {},
			method: 'POST',
			url: 'https://localhost',
			body: security.encrypt({ id: 1 }),
			container: {
				cradle: {
					logger: { info: console.info },
				},
			},
		};

		const res = { send: (v) => v };
		test('should able to decrypt data', async () => {
			const spyFunc = jest.spyOn(req.container.cradle.logger, 'info');
			middlewares.cipher(req, res, (v) => v);
			res.send({});
			expect(spyFunc).toHaveBeenCalledTimes(2);
			spyFunc.mockRestore();
		});

		test('should able to encrypt data', async () => {
			const spyFunc = jest.spyOn(req.container.cradle.logger, 'info');
			req.method = 'GET';
			middlewares.cipher(req, res, (v) => v);
			const v = res.send({});
			expect(spyFunc).toHaveBeenCalledTimes(1);
			expect(v.split(':').length).toBe(2);
			spyFunc.mockRestore();
		});

		test('should able skip cipher', async () => {
			req.headers = { 'AES-HEX-KEY': process.env.AES_HEX_KEY };
			const spyFunc = jest.spyOn(req.container.cradle.logger, 'info');
			middlewares.cipher(req, res, (v) => v);
			expect(spyFunc).toHaveBeenCalledTimes(0);
			spyFunc.mockRestore();
		});
	});
});
