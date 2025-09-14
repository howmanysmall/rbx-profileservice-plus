//!native
//!optimize 2

import Differ from "differ";
import noYield from "no-yield";
import type { Profile } from "types/globals";
import type { UpdateResult } from "types/types";

function profileUpdate<DataType extends object>(
	profile: Writable<Profile<DataType>>,
	callback: (profileData: DataType) => void,
	skipUpdate = false,
): UpdateResult<DataType> {
	const dataBefore = Differ.copyDeepWithCircularCheck(profile.Data, undefined);
	const [success, exception] = pcall(() => noYield(callback, profile.Data));

	if (!success) {
		profile.Data = dataBefore;
		const exceptionString = tostring(exception);
		if (exceptionString.find("yield", 1, true)[0] === undefined)
			throw `[ProfileServicePlus] Update failed: ${exceptionString}`;
		throw `[ProfileServicePlus] Update callback cannot yield - callbacks must be synchronous: ${exceptionString}`;
	}

	const changesSet = new Set<string>();
	Differ.diffTables(dataBefore, profile.Data, "", changesSet, 0);

	const [paths, count] = Differ.buildPathArray(changesSet);
	if (!skipUpdate && count > 0) {
		const dataUpdated = profile.DataUpdated;
		for (const path of paths) dataUpdated.FireBindableUnsafe(path);
	}

	return { Changed: count > 0, Count: count, Paths: paths };
}

export = profileUpdate;
