export type IsAccessible<T> = T extends object ? true : false;
export type Paths<T> = {
	[k in keyof T]: IsAccessible<T[k]> extends true ? k | `${k & string}.${Paths<T[k]> & string}` : k;
}[keyof T];

export type PathToValue<V, K extends string> = K extends `${infer A}.${infer B}`
	? A extends keyof V
		? PathToValue<V[A], B>
		: never
	: K extends keyof V
	? V[K]
	: never;
