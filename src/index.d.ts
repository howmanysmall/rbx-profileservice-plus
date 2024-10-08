import type { PathToValue as PathToValueType, Paths as PathsType } from "./advanced-types";
import type {
	GlobalUpdateData as GlobalUpdateDataType,
	GlobalUpdateHandler as GlobalUpdateHandlerType,
	GlobalUpdates as GlobalUpdatesType,
	NotReleasedHandler as NotReleasedHandlerType,
	ProfileMetadata as ProfileMetadataType,
	ProfileStore as ProfileStoreType,
	Profile as ProfileType,
	ViewProfile as ViewProfileType,
} from "./globals";
import type ProfileVersionQueryType from "./profile-version-query";

/**
 * ProfileService is a Roblox module that provides a simple API for saving and
 * loading player data.
 *
 * This is a fork of it with a few added features.
 */
declare namespace ProfileService {
	/**
	 * Set to false when the Roblox server is shutting down. `ProfileStore`
	 * methods should not be called after this value is set to `false`
	 */
	export const ServiceLocked: boolean;

	/**
	 * Analytics endpoint for DataStore error logging. Example usage:
	 * @example
	 *	ProfileService.IssueSignal.Connect((errorMessage, profileStoreName, profileKey) => {
	 *		pcall(() => {
	 *			AnalyticsService.FireEvent("ProfileServiceIssue", errorMessage, profileStoreName, profileKey)
	 *	   })
	 *	})
	 */
	export const IssueSignal: RBXScriptSignal<
		(errorMessage: string, profileStoreName: string, profileKey: string) => void
	>;

	/**
	 * Analytics endpoint for cases when a DataStore key returns a value that
	 * has all or some of it's profile components set to invalid data types.
	 * E.g., accidentally setting Profile.Data to a non table value
	 */
	export const CorruptionSignal: RBXScriptSignal<(profileStoreName: string, profileKey: string) => void>;

	/**
	 * Analytics endpoint for cases when DataStore is throwing too many errors
	 * and it's most likely affecting your game really really bad - this could
	 * be due to developer errors or due to Roblox server problems. Could be
	 * used to alert players about data store outages.
	 */
	export const CriticalStateSignal: RBXScriptSignal<(isCriticalState: boolean) => void>;

	export const ProfileResult: RBXScriptSignal<(functionName: string, profileTime: number) => void>;
	export let FireProfileResult: boolean;

	/**
	 * `ProfileStore` objects expose methods for loading / viewing profiles and
	 * sending global updates. Equivalent of [:GetDataStore()](https://developer.roblox.com/en-us/api-reference/function/DataStoreService/GetDataStore)
	 * in Roblox [DataStoreService](https://developer.roblox.com/en-us/api-reference/class/DataStoreService)
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
	 * @param profileStoreIndex DataStore name
	 * @param profileTemplate Profile.Data will default to given table (deep-copy) when no data was saved previously
	 */
	export function GetProfileStore<ProfileTemplate extends object, RobloxMetadata = unknown>(
		profileStoreIndex:
			| {
					/**
					 * DataStore name
					 */
					readonly Name: string;

					/**
					 * DataStore scope
					 */
					readonly Scope?: string;
			  }
			| string,
		profileTemplate: ProfileTemplate,
	): ProfileStore<ProfileTemplate, RobloxMetadata>;

	export function IsLive(): boolean;

	// Exported types.

	export type NotReleasedHandler = NotReleasedHandlerType;
	export type GlobalUpdateData = GlobalUpdateDataType;
	export type GlobalUpdateHandler = GlobalUpdateHandlerType;
	export type GlobalUpdates = GlobalUpdatesType;
	export type ProfileMetadata = ProfileMetadataType;
	export type Profile<DataType extends object, RobloxMetadata = unknown> = ProfileType<DataType, RobloxMetadata>;
	export type ViewProfile<DataType extends object, RobloxMetadata = unknown> = ViewProfileType<
		DataType,
		RobloxMetadata
	>;
	export type ProfileStore<T extends object, RobloxMetadata = unknown> = ProfileStoreType<T, RobloxMetadata>;

	/**
	 * Used to create a path string type.
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
