import path from 'node:path';
import fs from 'node:fs';
import { I18n, type GlobalCatalog, type LocaleCatalog } from 'i18n';
import { listModules } from 'awilix';
import { array } from '../../utils';
import express from 'express';

const namespaces = [
	...listModules(['../../locales/**/*.json'], { cwd: __dirname }),
	...listModules(['src/locales/**/*.json']),
];

const locales = array.removeDuplicates([
	...fs.readdirSync(`${path.join(__dirname, '../../locales')}`),
	...fs.readdirSync('./src/locales/'),
]);

const staticCatalog: GlobalCatalog = {};
for (const namespace of namespaces) {
	const locale = namespace.path.split('/').at(-2) ?? 'en';
	staticCatalog[locale] = staticCatalog[locale] ?? {};
	staticCatalog[locale][namespace.name] = {
		...(staticCatalog[locale][namespace.name] as LocaleCatalog),
		...JSON.parse(fs.readFileSync(namespace.path, { encoding: 'utf8' })),
	};
}

const i18nConfig = new I18n({
	defaultLocale: 'en',
	retryInDefaultLocale: true,
	objectNotation: true,
	locales: locales.uniques,
	directory: `${process.cwd()}/src/locales`,
	staticCatalog,
});

export const i18n = (req: express.Request, res: express.Response, next: express.NextFunction) =>
	i18nConfig.init(req, res, next);
