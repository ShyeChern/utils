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

	log() {
		console.log(new Date().toISOString(), this.requestId, ...arguments);
	}

	info() {
		console.info(new Date().toISOString(), this.requestId, ...arguments);
	}

	error() {
		console.error(new Date().toISOString(), this.requestId, ...arguments);
	}
}
