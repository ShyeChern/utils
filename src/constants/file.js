const file = Object.freeze({
	SIZE: {
		'1MB': 1048576,
		'10MB': 10485760,
	},
	DIRECTORY: {
		PROFILE_IMAGE: 'uploads/profile-images/',
	},
	MULTER_ERROR_CODE: {
		FILE_SIZE: 'LIMIT_FILE_SIZE',
	},
	MIME_TYPE: {
		PDF: 'application/pdf',
		XLS: 'application/vnd.ms-excel',
		XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		JPEG: 'image/jpeg',
		PNG: 'image/png',
	},
});

module.exports = file;
