// Define a maximum recursion depth
type MaxDepth = 10; // Adjust this value as needed

// Decrement type to decrease the depth
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

// Determine if a type is accessible for recursion
export type IsAccessible<T> = T extends object
	? T extends Callback
		? false
		: T extends Array<any>
			? false
			: true
	: false;

// Modified Paths<T> with numeric depth control
export type Paths<T, D extends number = MaxDepth> = [D] extends [never]
	? never
	: D extends 0
		? never
		: {
				[K in keyof T]: IsAccessible<T[K]> extends true
					? K extends string
						? `${K}.${Paths<T[K], Decrement<D>> & string}` | K
						: never
					: K & string;
			}[keyof T];

// Unmodified PathToValue as it doesn't cause recursion issues
export type PathToValue<V, K extends string> = K extends `${infer A}.${infer B}`
	? A extends keyof V
		? PathToValue<V[A], B>
		: never
	: K extends keyof V
		? V[K]
		: never;
