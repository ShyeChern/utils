const container = require('../container');

module.exports = (req, res, next) => {
	req.container = container.cradle.createScope(req);
	return next();
};
