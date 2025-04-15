const { security } = require('../../../lib');

describe('utils/security', () => {
	describe('generateToken verifyToken', () => {
		const payload = { id: 1, name: 'unit_test' };
		let token;
		let result = {};
		test('should generate token', () => {
			token = security.generateToken(payload);
			expect(typeof token).toBe('string');
		});

		test('should verify token', () => {
			result = security.verifyToken(token);
			expect(result.id).toBe(payload.id);
		});

		test('should have expire date', () => {
			result = security.verifyToken(token);
			expect(typeof (result.exp - result.iat)).toBe('number');
		});

		test('should accept expiresIn option', () => {
			const token = security.generateToken(payload, { expiresIn: '1d' });
			const result = security.verifyToken(token);
			expect(result.exp - result.iat).toBe(86400);
		});

		test('should accept refresh option', () => {
			const token = security.generateToken(payload, { refresh: true });
			const result = security.verifyToken(token, { refresh: true });
			expect(result.id).toBe(payload.id);
		});
	});

	describe('hash', () => {
		const password = 'SomePassword';
		let hashedPassword;
		test('should hash password', () => {
			hashedPassword = security.hash(password);
			const [hash, salt] = hashedPassword.split(':');
			expect(hash.length).toBe(128);
			expect(salt.length).toBe(32);
		});

		test('should verify password', () => {
			const result = security.verifyHash(password, hashedPassword);
			expect(result).toBe(true);
		});
	});

	describe('encrypt decrypt', () => {
		const data = {
			id: 1,
		};
		let encryptedData = '';
		test('should encrypt data', () => {
			encryptedData = security.encrypt(data);
			expect(encryptedData.split(':').length).toBe(2);
		});

		test('should decrypt data', () => {
			const result = security.decrypt(encryptedData);
			expect(result.id).toBe(data.id);
		});
	});
});
