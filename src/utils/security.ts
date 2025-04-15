import crypto from 'node:crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { app } from '../constants';
import { string } from '../utils';

type TokenOption = {
	/** is refresh token */
	refresh?: boolean;
};

/**
 * Generate jwt token
 */
export const generateToken = (
	payload: Record<string, any>,
	options: SignOptions & TokenOption = {},
) => {
	let secret = process.env.JWT_SECRET!;
	options = {
		...options,
	};
	if (!options.expiresIn) options.expiresIn = 60 * 10;
	if (options.refresh) {
		secret += '_refresh';
		delete options.refresh;
	}
	const token = jwt.sign(payload, secret, options);
	return token;
};

/**
 * Verify jwt token
 */
export const verifyToken = (token: string, options: SignOptions & TokenOption = {}) => {
	let secret = process.env.JWT_SECRET!;
	options = {
		...options,
	};
	if (options.refresh) {
		secret += '_refresh';
		delete options.refresh;
	}
	const payload = jwt.verify(token, secret, options);
	return payload;
};

/**
 * Hash text string
 */
export const hash = (text: string) => {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.scryptSync(text, salt, 64).toString('hex');
	return `${hash}:${salt}`;
};

/**
 * Verify text string with a hashed value
 */
export const verifyHash = (text: string, hashed: string) => {
	const [hash, salt] = hashed.split(':');
	if (!hash || !salt) return false;
	const hashedText = crypto.scryptSync(text, salt, 64);
	const result = crypto.timingSafeEqual(hashedText, Buffer.from(hash, 'hex'));
	return result;
};

export const encrypt = (data: string | Record<string, unknown>) => {
	const key = process.env.AES_HEX_KEY;
	if (!key) throw new Error('AES_HEX_KEY not found');

	if (typeof data !== 'string') data = JSON.stringify(data);

	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(app.ALGORITHM.AES_256_CBC, Buffer.from(key, 'hex'), iv);
	let encrypted = cipher.update(data, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (text: string) => {
	const key = process.env.AES_HEX_KEY;
	if (!key) throw new Error('AES_HEX_KEY not found');

	const splitted = text.split(':');
	if (!splitted[0] || !splitted[1]) throw new Error('Invalid text format, cannot decrypt data');

	const [ivHex, data] = splitted;
	const ivBuffer = Buffer.from(ivHex, 'hex');
	const decipher = crypto.createDecipheriv(
		app.ALGORITHM.AES_256_CBC,
		Buffer.from(key, 'hex'),
		ivBuffer,
	);
	let decrypted = decipher.update(data, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return string.isJson(decrypted);
};
