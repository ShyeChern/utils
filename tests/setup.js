// eslint-disable-next-line no-unused-vars
module.exports = async function (globalConfig, projectConfig) {
	process.env.JWT_SECRET = 'TEST';
	console.log('\npre run tests');
};
