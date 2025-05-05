const { RepositoryBase } = require('../../express-core');
const model = require('./audits.model');

module.exports = class AuditRepository extends RepositoryBase {
	constructor(opts) {
		super(model, opts);
	}
};
