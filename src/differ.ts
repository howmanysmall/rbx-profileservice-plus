//!native
//!optimize 2

import type { Paths } from "index";

const MAX_DEPTH = 10 as const;
if (MAX_DEPTH > 20) throw "[ProfileServicePlus] MAX_DEPTH cannot exceed 20";

const PATH_SEPARATOR = "." as const;

const pathBuffer: [string, string] = ["", ""];
const visitedBuffer = new Set<unknown>();

type AnyMap = Map<unknown, unknown>;

namespace Differ {
	export type MaxDepth = typeof MAX_DEPTH;

	/**
	 * Creates a deep copy of a table with circular reference detection. Uses
	 * `table.clone` for shallow copy then recursively clones nested tables.
	 *
	 * @template T - Type of the object to copy.
	 * @param object - The object to copy.
	 * @param visited - Table tracking visited objects.
	 * @returns Deep copy of the object.
	 */
	export function copyDeepWithCircularCheck<T>(object: T, visited?: Set<unknown>): T {
		if (!typeIs(object, "table")) return object;

		visited ??= visitedBuffer;
		if (visited.has(object)) throw "[ProfileServicePlus] Circular reference detected in profile data";

		visited.add(object);

		const result = table.clone(object);
		for (const [key, value] of result as unknown as AnyMap)
			if (typeIs(value, "table")) rawset(result, key, copyDeepWithCircularCheck(value, visited));

		visited.delete(object);
		return result;
	}

	/**
	 * Optimized path builder that reduces string allocations.
	 *
	 * @param parentPath - The parent path string.
	 * @param key - The key to append to the path.
	 * @returns The constructed path string.
	 */
	export function buildPath(parentPath: string, key: unknown): string {
		if (parentPath === "") return tostring(key);

		pathBuffer[0] = parentPath;
		pathBuffer[1] = tostring(key);
		return pathBuffer.join(PATH_SEPARATOR);
	}

	/**
	 * Compares two tables and finds all paths that have changed. Optimized with
	 * early exits and reduced allocations.
	 *
	 * @param previousData - The original data.
	 * @param newData - The modified data.
	 * @param path - The current path, used for recursion.
	 * @param changesSet - Set of changed paths.
	 * @param depth - Current recursion depth.
	 * @returns Set of changed paths.
	 */
	export function diffTables(
		previousData: unknown,
		newData: unknown,
		path: string,
		changesSet: Set<string>,
		depth: number,
	): Set<string> {
		if (depth > MAX_DEPTH) throw `[ProfileServicePlus] Maximum nesting depth exceeded (${MAX_DEPTH} levels)`;

		if (!typeIs(previousData, "table") || !typeIs(newData, "table")) {
			if (previousData !== newData) changesSet.add(path);
			return changesSet;
		}

		const localSeenKeys = new Set<unknown>();
		for (const [key, newValue] of newData as AnyMap) {
			localSeenKeys.add(key);
			const previousValue = rawget(previousData, key);
			const currentPath = buildPath(path, key);

			const previousIsTable = typeIs(previousValue, "table");
			const newIsTable = typeIs(newValue, "table");

			if (previousIsTable && newIsTable) {
				diffTables(previousValue, newValue, currentPath, changesSet, depth + 1);
			} else if (previousValue !== newValue) {
				changesSet.add(currentPath);
			}
		}

		for (const [key] of previousData as AnyMap) {
			if (!localSeenKeys.has(key)) {
				changesSet.add(buildPath(path, key));
			}
		}
		return changesSet;
	}

	/**
	 * Optimized path array builder.
	 *
	 * @template DataType - The object type to generate paths from.
	 * @param changesSet - Set of changed paths.
	 * @returns Sorted array of changed paths.
	 */
	export function buildPathArray<DataType extends object>(
		changesSet: Set<string>,
	): LuaTuple<[ReadonlyArray<Paths<DataType>>, number]> {
		if (changesSet.isEmpty()) return $tuple([], 0);

		const paths = new Array<Paths<DataType>>();
		let length = 0;
		for (const path of changesSet) paths[length++] = path as Paths<DataType>;
		return $tuple(paths.sort(), length);
	}
}

export = Differ;
