export interface User {
	role: string;
	access: Record<string, boolean>;
	[key: string]: unknown;
}
