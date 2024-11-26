const path = require('node:path');
const fs = require('node:fs');
const { I18n } = require('i18n');
const { listModules } = require('awilix');
const { array } = require('../../utils');

const namespaces = [
	...listModules(['../../locales/**/*.json'], { cwd: __dirname }),
	...listModules(['src/locales/**/*.json']),
];

const locales = array.removeDuplicates([
	...fs.readdirSync(`${path.join(__dirname, '../../locales')}`),
	...fs.readdirSync('./src/locales/'),
]);

const staticCatalog = {};
for (const namespace of namespaces) {
	const locale = namespace.path.split('/').at(-2);
	staticCatalog[locale] = staticCatalog[locale] ?? {};
	staticCatalog[locale][namespace.name] = {
		...staticCatalog[locale][namespace.name],
		...JSON.parse(fs.readFileSync(namespace.path, { encoding: 'utf8' })),
	};
}

const i18n = new I18n({
	defaultLocale: 'en',
	retryInDefaultLocale: true,
	objectNotation: true,
	locales: locales.uniques,
	directory: `${process.cwd()}/src/locales`,
	staticCatalog,
});

module.exports = (...args) => i18n.init(...args);
