import type { ScriptSignal } from "types/types";

import type { Paths as PathsType, PathToValue as PathToValueType } from "./types/advanced-types";
import type {
	GlobalUpdateData as GlobalUpdateDataType,
	GlobalUpdateHandler as GlobalUpdateHandlerType,
	GlobalUpdates as GlobalUpdatesType,
	NotReleasedHandler as NotReleasedHandlerType,
	Profile as ProfileType,
	ProfileMetadata as ProfileMetadataType,
	ProfileStore as ProfileStoreType,
	ViewProfile as ViewProfileType,
} from "./types/globals";
import type ProfileVersionQueryType from "./types/profile-version-query";

// eslint-disable-next-line jsdoc/require-returns -- this is a namespace you idiot
/**
 * ProfileService is a Roblox module that provides a simple API for saving and
 * loading player data.
 *
 * This is a fork of it with a few added features.
 */
declare namespace ProfileService {
	/**
	 * Set to false when the Roblox server is shutting down. `ProfileStore`
	 * methods should not be called after this value is set to `false`.
	 */
	export const ServiceLocked: boolean;

	/**
	 * Analytics endpoint for DataStore error logging.
	 *
	 * @example
	 *
	 * ```ts
	 * ProfileService.IssueSignal.Connect(
	 * 	(errorMessage, profileStoreName, profileKey) => {
	 * 		pcall(() => {
	 * 			AnalyticsService.FireEvent(
	 * 				"ProfileServiceIssue",
	 * 				errorMessage,
	 * 				profileStoreName,
	 * 				profileKey,
	 * 			);
	 * 		});
	 * 	},
	 * );
	 * ```
	 */
	export const IssueSignal: ScriptSignal<
		(errorMessage: string, profileStoreName: string, profileKey: string) => void
	>;

	/**
	 * Analytics endpoint for cases when a DataStore key returns a value that
	 * has all or some of it's profile components set to invalid data types.
	 * E.g., accidentally setting Profile.Data to a non table value.
	 */
	export const CorruptionSignal: ScriptSignal<(profileStoreName: string, profileKey: string) => void>;

	/**
	 * Analytics endpoint for cases when DataStore is throwing too many errors
	 * and it's most likely affecting your game really really bad - this could
	 * be due to developer errors or due to Roblox server problems. Could be
	 * used to alert players about data store outages.
	 */
	export const CriticalStateSignal: ScriptSignal<(isCriticalState: boolean) => void>;

	export const ProfileResult: ScriptSignal<(functionName: string, profileTime: number) => void>;
	// eslint-disable-next-line import/no-mutable-exports -- this is intentional and fine
	export let FireProfileResult: boolean;

	/**
	 * `ProfileStore` objects expose methods for loading / viewing profiles and
	 * sending global updates. Equivalent of
	 * [:GetDataStore()](https://developer.roblox.com/en-us/api-reference/function/DataStoreService/GetDataStore)
	 * in Roblox
	 * [DataStoreService](https://developer.roblox.com/en-us/api-reference/class/DataStoreService)
	 * API.
	 *
	 * By default, `profile_template` is only copied for `Profile.Data` for new
	 * profiles. Changes made to `profile_template` can be applied to
	 * `Profile.Data` of previously saved profiles by calling
	 * [Profile:Reconcile()](https://madstudioroblox.github.io/ProfileService/api/#profilereconcile).
	 * You can also create your own function to fill in the missing components
	 * in `Profile.Data` as soon as it is loaded or have `nil` exceptions in
	 * your personal `:Get()` and `:Set()` method libraries.
	 *
	 * @param profileStoreIndex - DataStore name.
	 * @param profileTemplate - Profile.Data will default to given table
	 *   (deep-copy) when no data was saved previously.
	 * @returns A ProfileStore instance for managing profiles in the specified
	 *   DataStore.
	 */
	export function GetProfileStore<ProfileTemplate extends object, RobloxMetadata = unknown>(
		profileStoreIndex:
			| string
			| {
					/** DataStore name. */
					readonly Name: string;

					/** DataStore scope. */
					readonly Scope?: string;
			  },
		profileTemplate: ProfileTemplate,
	): ProfileStore<ProfileTemplate, RobloxMetadata>;

	export function IsLive(): boolean;

	// Exported types.

	export type NotReleasedHandler = NotReleasedHandlerType;
	export type GlobalUpdateData = GlobalUpdateDataType;
	export type GlobalUpdateHandler = GlobalUpdateHandlerType;
	export type GlobalUpdates = GlobalUpdatesType;
	export type ProfileMetadata = ProfileMetadataType;
	export type Profile<DataType extends object, RobloxMetadata = unknown> = ProfileType<
		DataType,
		RobloxMetadata,
		true
	>;
	export type ViewProfile<DataType extends object, RobloxMetadata = unknown> = ViewProfileType<
		DataType,
		RobloxMetadata,
		true
	>;
	export type ProfileStore<T extends object, RobloxMetadata = unknown> = ProfileStoreType<T, RobloxMetadata>;

	/**
	 * Used to create a path string type.
	 *
	 * @template T - The object type to generate paths from.
	 * @template D - The maximum depth to generate paths for.
	 */
	export type Paths<T, D extends number = 10> = PathsType<T, D>;
	export type PathToValue<V, K extends string> = PathToValueType<V, K>;

	export type ProfileVersionQuery<T extends object, RobloxMetadata = unknown> = ProfileVersionQueryType<
		T,
		RobloxMetadata
	>;
}

export = ProfileService;
export as namespace ProfileService;
