import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

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
