import 'express';
import i18n from 'i18n';
import awilix from 'awilix';

declare module 'express-serve-static-core' {
	export interface Request {
		__: i18n;
		container: awilix.AwilixContainer;
	}
}
