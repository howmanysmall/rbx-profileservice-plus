type MaxDepth = 10;

type Decrement<N extends number> = N extends 1
	? 0
	: N extends 2
		? 1
		: N extends 3
			? 2
			: N extends 4
				? 3
				: N extends 5
					? 4
					: N extends 6
						? 5
						: N extends 7
							? 6
							: N extends 8
								? 7
								: N extends 9
									? 8
									: N extends 10
										? 9
										: N extends 11
											? 10
											: N extends 12
												? 11
												: N extends 13
													? 12
													: N extends 14
														? 13
														: N extends 15
															? 14
															: N extends 16
																? 15
																: N extends 17
																	? 16
																	: N extends 18
																		? 17
																		: N extends 19
																			? 18
																			: N extends 20
																				? 19
																				: never;

export type Paths<T, D extends number = MaxDepth> = [D] extends [never]
	? never
	: D extends 0
		? never
		: T extends ReadonlyArray<unknown>
			? never
			: T extends Callback
				? never
				: T extends object
					? {
							[K in keyof T]: K extends string
								? T[K] extends ReadonlyArray<unknown>
									? K
									: T[K] extends Callback
										? K
										: T[K] extends object
											? `${K}.${Paths<T[K], Decrement<D>>}` | K
											: K
								: never;
						}[keyof T & string]
					: never;

export type PathToValue<T, P extends string> = P extends `${infer Head}.${infer Tail}`
	? Head extends keyof T
		? // biome-ignore lint/suspicious/noExplicitAny: necessary evil
			T[Head] extends Record<any, infer RV>
			? RV
			: T[Head] extends object
				? PathToValue<T[Head], Tail>
				: never
		: never
	: P extends keyof T
		? T[P]
		: never;
