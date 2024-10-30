interface LoggerOption {
	requestId: string;
}

/**
 * @todo convert to winston
 */
export class Logger {
	requestId: string;
	constructor(opts: LoggerOption) {
		this.requestId = opts.requestId;
	}

	log(...args: any[]) {
		console.log(new Date().toISOString(), this.requestId, ...args);
	}

	info(...args: any[]) {
		console.info(new Date().toISOString(), this.requestId, ...args);
	}

	error(...args: any[]) {
		console.error(new Date().toISOString(), this.requestId, ...args);
	}
}
