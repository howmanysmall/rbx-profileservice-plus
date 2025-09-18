import type { MaxDepth } from "differ";

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

/**
 * Builds a union of dot-delimited property access paths into the object type
 * `T` up to a maximum depth.
 *
 * This recursively walks plain object properties (excluding arrays and
 * callback/function types) and produces a string literal union representing
 * every reachable path. Each intermediate segment is also included (e.g.
 * `"player.stats.level" | "player.stats" | "player"`). Recursion stops when:
 *
 * - The configured depth budget `D` reaches `0`.
 * - A property value is an array (`ReadonlyArray<unknown>`), a callback
 *   (assignable to `Callback`), or a non-object primitive.
 *
 * Arrays and callbacks are treated as leaves: their own key is emitted, but no
 * deeper traversal occurs. The depth parameter decrements via the internal
 * `Decrement` helper so the type remains distributive and safe.
 *
 * @remarks
 * Depth limiting is important to avoid exponential blow-ups for very deep or
 * cyclic-like (mutually recursive) shapes. Adjust `MaxDepth` or supply a
 * narrower `D` if type performance degrades.
 * @example
 *
 * ```typescriot
 * interface PlayerData { player: { stats: { level: number; xp: number } }; version: number }
 * type P = Paths<PlayerData>;
 * //   ^? "player" | "player.stats" | "player.stats.level" | "player.stats.xp" | "version"
 * ```
 *
 * @template T Root object type whose property paths will be enumerated.
 * @template D Maximum recursion depth (default: `MaxDepth`). Larger values
 *   allow deeper nesting but increase type computation cost.
 * @returns A union of string literal paths (e.g. `"a" | "a.b" | "c"`). Returns
 *   `never` if `T` is not an object or no paths are valid under the
 *   constraints.
 */
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
							[K in keyof T]: K extends number | string
								? T[K] extends ReadonlyArray<unknown>
									? `${K & (number | string)}`
									: T[K] extends Callback
										? `${K & (number | string)}`
										: T[K] extends object
											?
													| `${K & (number | string)}.${Paths<T[K], Decrement<D>>}`
													| `${K & (number | string)}`
											: `${K & (number | string)}`
								: never;
						}[keyof T & (number | string)]
					: never;

/**
 * Resolves the TypeScript type located at a dot-delimited path `P` within
 * object type `T`.
 *
 * Splits the path on dots and walks the corresponding property chain. Special
 * handling is applied to index-signature like dictionary objects (i.e. Values
 * assignable to `Record<any, X>`): when such a property is encountered at any
 * non-terminal segment, the value type `X` is returned immediately (tail
 * segments are not further inspected). For ordinary object properties the
 * traversal continues until the final segment is reached or an invalid segment
 * halts resolution with `never`..
 *
 * @remarks
 * Dictionary short-circuit: For a property typed like `Record<string, V>` the
 * generic infers `V` and returns it immediately, ignoring any remaining tail
 * path. This is intentional for broad map structures but means deeper
 * addressing into map values via the path string is not supported here.
 * @example
 *
 * ```ts
 * interface PlayerData {
 * 	player: { stats: { level: number; xp: number } };
 * 	version: number;
 * }
 * type LevelType = PathToValue<PlayerData, "player.stats.level">; // number
 * type VersionType = PathToValue<PlayerData, "version">; // number
 * type Bad = PathToValue<PlayerData, "player.items">; // never (no such path)
 * ```
 *
 * @template T Root object type being inspected.
 * @template P Dot-delimited string path to resolve (e.g.
 *   `"player.stats.level"`).
 * @returns The property type at the specified path, or `never` if the path is
 *   invalid for `T`.
 */
export type PathToValue<T, P extends string> = P extends `${infer Head}.${infer Tail}`
	? Head extends keyof T
		? T[Head] extends object
			? PathToValue<T[Head], Tail>
			: never
		: never
	: P extends keyof T
		? T[P]
		: T extends Record<number | string, infer V>
			? V
			: never;

export type DeepWritable<T> = {
	-readonly [P in keyof T]: T[P] extends object ? DeepWritable<T[P]> : T[P];
};

export type DeepReadonly<T> =
	T extends Map<infer K, infer V>
		? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
		: T extends Set<infer U>
			? ReadonlySet<DeepReadonly<U>>
			: T extends Array<infer U>
				? ReadonlyArray<DeepReadonly<U>>
				: T extends object
					? { readonly [P in keyof T]: DeepReadonly<T[P]> }
					: T;
