export const app = Object.freeze({
	SYSTEM_USER: {
		id: 'SYSTEM',
		username: 'service',
	},

	ACTION: {
		CREATE: 'CREATE',
		UPDATE: 'UPDATE',
		DELETE: 'DELETE',
	},

	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
});
