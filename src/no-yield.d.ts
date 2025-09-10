declare function noYield<T extends ReadonlyArray<unknown>, U extends Array<unknown>>(
	func: (...parameters: T) => LuaTuple<U>,
	...parameters: T
): LuaTuple<[false, ...{ [K in keyof U]: K extends "0" ? unknown : undefined }] | [true, ...U]>;
declare function noYield<T extends ReadonlyArray<unknown>, U>(
	func: (...parameters: T) => U,
	...parameters: T
): LuaTuple<[false, unknown] | [true, U]>;
export = noYield;
