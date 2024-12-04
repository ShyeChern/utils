import { app } from '../constants';

export type ErrorParam = {
	statusCode?: number;
	code?: string;
	error?: object;
};

export class BaseError extends Error {
	statusCode: number;
	code?: string;
	error?: object;

	constructor(message: string, params?: string | number | ErrorParam) {
		super(message);
		this.statusCode = app.BAD_REQUEST;
		this.processParams(params);
	}

	processParams(params?: string | number | ErrorParam) {
		if (!params) return;

		if (typeof params === 'string') {
			this.code = params;
			return;
		}

		if (typeof params === 'number') {
			this.statusCode = params;
			return;
		}

		if (params.statusCode) {
			this.statusCode = params.statusCode;
		}
		if (params.error) {
			this.error = params.error;
		}
		if (params.code) {
			this.code = params.code;
		}
	}
}
