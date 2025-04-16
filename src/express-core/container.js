const {
	createContainer,
	InjectionMode,
	asClass,
	asValue,
	Lifetime,
	asFunction,
} = require('awilix');
const { format } = require('date-fns');
const NodeCache = require('node-cache');
const { string, Logger } = require('../utils');
const { cache } = require('../constants');
const mongo = require('../mongodb');

const container = createContainer({
	strict: true,
	injectionMode: InjectionMode.PROXY,
});

const init = (opts) => {
	return async () => {
		const modules = [
			['src/*/*/*.controller.js', { register: asClass, lifetime: Lifetime.SCOPED }],
			['src/*/*/*.service.js', { register: asClass, lifetime: Lifetime.SCOPED }],
			['src/*/*/*.repository.js', { register: asClass, lifetime: Lifetime.SCOPED }],
			['src/*/*/*.validator.js', { register: asClass, lifetime: Lifetime.SINGLETON }],
			['src/*/*/*.model.js', { register: asValue, lifetime: Lifetime.SINGLETON }],
			['src/*/*/*.route.js', { register: asValue, lifetime: Lifetime.SINGLETON }],
			['src/mongodb/seeders/*.seeder.js', { register: asValue, lifetime: Lifetime.SINGLETON }],
			[
				'src/mongodb/migrations/*.migration.js',
				{ register: asValue, lifetime: Lifetime.SINGLETON },
			],
		];
		const options = {
			formatName: (name, descriptor) => {
				if (name.includes('.model')) return name;
				if (name.includes('.route')) return name;
				return descriptor.value.name ? string.toCamelCase(descriptor.value.name) : name;
			},
		};

		container.loadModules(modules, options);
		container.loadModules(
			modules.map((v) => [v[0].replace('src', '..'), v[1]]),
			{ ...options, cwd: __dirname },
		);

		const mongodb = await mongo.init(opts);
		const appCache = new NodeCache();
		appCache.set(cache.ROLE, {});
		container.register({ cache: asValue(appCache), mongodb: asValue(mongodb) });
		console.log('init app');
	};
};

const createScope = () => {
	return (req, options = {}) => {
		const random = Math.floor(Math.random() * 1e6)
			.toString()
			.padStart(6, '0');
		const requestId = format(
			new Date(),
			`yy${random[0]}MM${random[1]}dd${random[2]}HH${random[3]}mm${random[4]}ss${random[5]}`,
		);
		const scope = container.createScope();
		scope.register({
			currentUser: asValue({}),
			requestId: asValue(requestId),
			req: asValue(req),
			...options,
		});
		return scope;
	};
};

container.register({
	init: asFunction(init),
	createScope: asFunction(createScope).singleton(),
	logger: asClass(Logger).scoped(),
});

module.exports = container;
