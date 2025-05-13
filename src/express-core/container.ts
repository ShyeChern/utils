import * as awilix from 'awilix';
import { format } from 'date-fns';
import NodeCache from 'node-cache';
import { string, Logger } from '../utils';
import { cache } from '../constants';
import mongodbCore from '../mongodb-core';
import { LoadModulesOptions } from 'awilix/lib/load-modules';
import express from 'express';

export interface ContainerModule {
	name: string;
	path: string;
	opts: unknown;
}

const container = awilix.createContainer({
	strict: true,
	injectionMode: awilix.InjectionMode.PROXY,
});

const init = (opts: Record<string, unknown>) => {
	return async () => {
		const modules: Array<awilix.GlobWithOptions> = [
			['src/*/*/*.controller.js', { register: awilix.asClass, lifetime: awilix.Lifetime.SCOPED }],
			['src/*/*/*.service.js', { register: awilix.asClass, lifetime: awilix.Lifetime.SCOPED }],
			['src/*/*/*.repository.js', { register: awilix.asClass, lifetime: awilix.Lifetime.SCOPED }],
			['src/*/*/*.validator.js', { register: awilix.asClass, lifetime: awilix.Lifetime.SINGLETON }],
			['src/*/*/*.model.js', { register: awilix.asValue, lifetime: awilix.Lifetime.SINGLETON }],
			['src/*/*/*.route.js', { register: awilix.asValue, lifetime: awilix.Lifetime.SINGLETON }],
			[
				'src/mongodb*/seeders/*.seeder.js',
				{ register: awilix.asValue, lifetime: awilix.Lifetime.SINGLETON },
			],
			[
				'src/mongodb*/migrations/*.migration.js',
				{ register: awilix.asValue, lifetime: awilix.Lifetime.SINGLETON },
			],
		];
		const options: LoadModulesOptions = {
			formatName: (name, descriptor) => {
				if (name.includes('.model')) return name;
				if (name.includes('.route')) return name;

				const value = descriptor.value as Record<string, unknown>;
				if (typeof value.name === 'string' && value.name !== '') {
					return string.toCamelCase(value.name as string);
				}

				return name;
			},
		};

		// load modules in service
		container.loadModules(modules, options);
		// load default modules in package
		container.loadModules(
			modules.map((v) => [v[0].replace('src', '..'), v[1]] as awilix.GlobWithOptions),
			{ ...options, cwd: __dirname },
		);

		const mongodb = await mongodbCore.init(opts);
		const appCache = new NodeCache();
		appCache.set(cache.ROLE, {});
		container.register({ cache: awilix.asValue(appCache), mongodb: awilix.asValue(mongodb) });
		console.log('init app');
	};
};

const createScope = () => {
	return (req: express.Request, options = {}) => {
		const random = Math.floor(Math.random() * 1e6)
			.toString()
			.padStart(6, '0');
		const requestId = format(
			new Date(),
			`yy${random[0]}MM${random[1]}dd${random[2]}HH${random[3]}mm${random[4]}ss${random[5]}`,
		);
		const scope = container.createScope();
		scope.register({
			currentUser: awilix.asValue({}),
			requestId: awilix.asValue(requestId),
			req: awilix.asValue(req),
			...options,
		});
		return scope;
	};
};

container.register({
	init: awilix.asFunction(init),
	createScope: awilix.asFunction(createScope).singleton(),
	logger: awilix.asClass(Logger).scoped(),
});

export { container };
