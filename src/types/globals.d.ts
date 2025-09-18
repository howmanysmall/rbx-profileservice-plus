/* eslint-disable max-classes-per-file -- i really don't care */
import type Signal from "@rbxts/rbx-better-signal";

import type { DeepReadonly, DeepWritable, Paths, PathToValue } from "./advanced-types";
import type ProfileVersionQuery from "./profile-version-query";
import type { ScriptSignal } from "./types";

type CorrectSignal<Signature extends Callback, ConnectOnly extends boolean> = ConnectOnly extends true
	? ScriptSignal<Signature>
	: Signal<Signature>;

export type NotReleasedHandler = (placeId: number, gameJobId: string) => "Cancel" | "ForceLoad" | "Repeat" | "Steal";

export type GlobalUpdateHandler = (globalUpdates: GlobalUpdates) => void;
export interface GlobalUpdateData {
	readonly [index: string]: unknown;
	readonly Type: string;
}

/**
 * Global updates is a powerful feature of ProfileService, used for sending
 * information to a desired player profile across servers, within the server or
 * to a player profile that is not currently active in any Roblox server (Kind
 * of like
 * [MessagingService](https://developer.roblox.com/en-us/api-reference/class/MessagingService),
 * but slower and doesn't require the recipient to be active). The primary
 * intended use of global updates is to support sending gifts among players, or
 * giving items to players through a custom admin tool. The benefit of using
 * global updates is it's API simplicity (This is as simple as it gets, sorry
 * 😂) and the fact that global updates are pulled from the DataStore whenever
 * the profile is auto-saved **at no additional expense of more DataStore
 * calls!**.
 *
 * Global updates can be `Active`, `Locked` and `Cleared`:
 *
 * - Whenever a GlobalUpdate is created, it will be `Active` by default
 * - `Active` updates can be **changed** or **cleared** within a
 *   `.GlobalUpdateProfileAsync()` call
 * - Normally, when the profile is active on a Roblox server, you should always
 *   progress all `Active` updates to the `Locked` state.
 * - `Locked` updates can no longer be **changed** or **cleared** within a
 *   `.GlobalUpdateProfileAsync()` call.
 * - `Locked` updates are ready to be processed (e.g. Add gift to player
 *   inventory) and immediately `Locked` by calling
 *   `.LockActiveUpdate(updateId)`
 * - `Cleared` updates will immediately disappear from the profile forever.
 */
export declare class GlobalUpdates {
	/**
	 * Used to send a new `Active` update to the profile.
	 *
	 * @param updateData - The new update.
	 */
	public AddActiveUpdate(updateData: GlobalUpdateData): void;

	/**
	 * Changing `Active` updates can be used for stacking player gifts,
	 * particularly when lots of players can be sending lots of gifts to a
	 * YouTube celebrity so the Profile would not exceed the DataStore data
	 * limit.
	 *
	 * @param updateId - Id of an existing global update.
	 * @param updateData - New data that replaces previously set updateData.
	 */
	public ChangeActiveUpdate(updateId: number, updateData: GlobalUpdateData): void;

	/**
	 * Removes an `Active` update from the profile completely.
	 *
	 * @param updateId - Id of an existing global update.
	 */
	public ClearActiveUpdate(updateId: number): void;

	/**
	 * Clears a `Locked` update completely from the profile.
	 *
	 * Do not call when profile has been released.
	 *
	 * @param updateId - Id of an existing locked global update.
	 */
	public ClearLockedUpdate(updateId: number): void;

	/**
	 * [[updateId, updateData]].
	 *
	 * Should be used immediately after a `Profile` is loaded to scan and
	 * progress any pending `Active` updates to a `Locked` state.
	 *
	 * @example
	 *
	 * ```ts
	 * for (const [updateId] of profile.GlobalUpdates.GetActiveUpdates())
	 * 	profile.GlobalUpdates.LockActiveUpdate(updateId);
	 * ```
	 *
	 * @returns A ReadonlyArray of active updates.
	 */
	public GetActiveUpdates(): ReadonlyArray<[updateId: number, updateData: GlobalUpdateData]>;

	/**
	 * Should be used immediately after a `Profile` is loaded to scan and
	 * progress any pending Locked updates to `Cleared` state.
	 *
	 * @example
	 *
	 * ```ts
	 * for (const [
	 * 	updateId,
	 * 	updateData,
	 * ] of profile.GlobalUpdates.GetLockedUpdates()) {
	 * 	if (
	 * 		updateData.Type === "AdminGift" &&
	 * 		updateData.Item == "Coins"
	 * 	)
	 * 		profile.Data.Coins += updateData.Amount;
	 *
	 * 	profile.GlobalUpdates.ClearLockedUpdate(updateId);
	 * }
	 * ```
	 *
	 * @returns A ReadonlyArray of locked updates.
	 */
	public GetLockedUpdates(): ReadonlyArray<[updateId: number, updateData: GlobalUpdateData]>;

	/**
	 * In most games, you should progress all Active updates to Locked state.
	 *
	 * @example
	 *
	 * ```ts
	 * profile.GlobalUpdates.ListenToNewActiveUpdate(
	 * 	(updateId, updateData) =>
	 * 		profile.GlobalUpdates.LockActiveUpdate(updateId),
	 * );
	 * ```
	 *
	 * @param listener - The listener for new active updates.
	 * @returns A connection object that can be used to disconnect the listener.
	 */
	public ListenToNewActiveUpdate(
		listener: (updateId: number, updateData: GlobalUpdateData) => void,
	): RBXScriptConnection;

	/**
	 * When you get a Locked update via
	 * `GlobalUpdates.ListenToNewLockedUpdate()`, the update is ready to be
	 * processed and immediately locked.
	 *
	 * @example
	 *
	 * ```ts
	 * profile.GlobalUpdates.ListenToNewLockedUpdate(
	 * 	(updateId, updateData) => {
	 * 		if (
	 * 			updateData.Type === "AdminGift" &&
	 * 			updateData.Item === "Coins"
	 * 		)
	 * 			profile.Data.Coins += updateData.Amount;
	 * 		profile.GlobalUpdates.ClearLockedUpdate(updateId);
	 * 	},
	 * );
	 * ```
	 *
	 * Must always call `GlobalUpdates.ClearLockedUpdate(updateId)` after
	 * processing the locked update.
	 *
	 * @param listener - The listener for new locked updates.
	 * @returns A connection object that can be used to disconnect the listener.
	 */
	public ListenToNewLockedUpdate(
		listener: (updateId: number, updateData: GlobalUpdateData) => void,
	): RBXScriptConnection;

	/**
	 * Turns an `Active` update into a `Locked` update. Will invoke
	 * `GlobalUpdates.ListenToNewLockedUpdate()` after an auto-save (less than
	 * 30 seconds), or `Profile.Save()`.
	 *
	 * Do not call when profile has been released.
	 *
	 * @param updateId - The id of the GlobalUpdate to lock.
	 */
	public LockActiveUpdate(updateId: number): void;

	protected constructor();
}

/** An object containing data about the profile itself. */
export interface ProfileMetadata {
	/**
	 * [placeId, gameJobId] | nil Set to a session link if a Roblox server is
	 * currently the owner of this profile; nil if released.
	 */
	readonly ActiveSession?: [placeId: number, gameJobId: string];

	/** Saved and auto-saved just like Profile.Data. */
	readonly Metatags: Map<string, unknown>;

	/**
	 * The most recent version of Metadata.Metatags which has been saved to the
	 * DataStore during the last auto-save or `Profile.Save()` call.
	 */
	readonly MetatagsLatest: Map<string, unknown>;

	/** `os.time()` timestamp of profile creation. */
	readonly ProfileCreateTime: number;

	/** Amount of times the profile was loaded. */
	readonly SessionLoadCount: number;
}

export declare class Profile<
	DataType extends object,
	RobloxMetadata = unknown,
	ConnectOnly extends boolean = false,
> extends ViewProfile<DataType, RobloxMetadata, ConnectOnly> {
	/**
	 * `Profile.Data` is the primary variable of a Profile object. The developer
	 * is free to read and write from the table while it is automatically saved
	 * to the
	 * [DataStore](https://developer.roblox.com/en-us/api-reference/class/DataStoreService).
	 * `Profile.Data` will no longer be saved after being released remotely or
	 * locally via `Profile:Release()`.
	 */
	public readonly Data: DeepReadonly<DataType>;

	/** A table containing data about the profile itself. */
	public readonly Metadata: ProfileMetadata;

	/**
	 * This signal fires after every auto-save, after
	 * `Profile.Metadata.MetatagsLatest` has been updated with the version
	 * that's guaranteed to be saved. `MetatagsUpdated` will fire regardless of
	 * whether `MetatagsLatest` changed after update.
	 *
	 * **`MetatagsUpdated` will also fire after the Profile is saved for the
	 * last time and released**. Remember that changes to `Profile.Data` will
	 * not be saved after release - `Profile:IsActive()` will return `false` if
	 * the profile is released.
	 *
	 * `MetatagsUpdated` example use can be found in the [Developer Products
	 * example
	 * code](https://madstudioroblox.github.io/ProfileService/tutorial/developer_products/).
	 */
	public readonly MetatagsUpdated: CorrectSignal<(metatagsLatest: ProfileMetadata) => void, ConnectOnly>;

	protected constructor();
}

export declare class ViewProfile<
	DataType extends object,
	RobloxMetadata = unknown,
	ConnectOnly extends boolean = false,
> {
	/**
	 * The primary variable of a Profile object. The developer is free to read
	 * and write from the table while it is automatically saved to the
	 * DataStore. `Profile.Data` will no longer be saved after being released
	 * remotely or locally via {@linkcode Release}.
	 */
	public readonly Data: DeepReadonly<DataType> | undefined;

	/**
	 * A signal that gets triggered every time `Profile.Data` is updated with a
	 * new value. This is fired when you call {@linkcode Set} or
	 * {@linkcode SetToPath}.
	 */
	public readonly DataUpdated: CorrectSignal<(path: Paths<DataType>) => void, ConnectOnly>;

	/**
	 * This is the GlobalUpdates object tied to this specific Profile. It
	 * exposes GlobalUpdates methods for update processing. (See [Global
	 * Updates](https://madstudioroblox.github.io/ProfileService/api/#global-updates)
	 * for more info).
	 */
	public readonly GlobalUpdates: GlobalUpdates;

	/**
	 * The [DataStoreKeyInfo (Official
	 * documentation)](https://developer.roblox.com/en-us/api-reference/class/DataStoreKeyInfo)
	 * instance related to this profile.
	 */
	public readonly KeyInfo: DataStoreKeyInfo;

	/**
	 * A signal that gets triggered every time `Profile.KeyInfo` is updated with
	 * a new
	 * [DataStoreKeyInfo](https://developer.roblox.com/en-us/api-reference/class/DataStoreKeyInfo)
	 * instance reference after every auto-save or profile release.
	 */
	public readonly KeyInfoUpdated: CorrectSignal<(dataStoreKeyInfo: DataStoreKeyInfo) => void, ConnectOnly>;

	/** A table containing data about the profile itself. */
	public readonly Metadata: ProfileMetadata | undefined;

	/**
	 * _Non-strict reference - developer can set this value to a new table
	 * reference_.
	 *
	 * Table that gets saved as [Metadata (Official
	 * documentation)](https://developer.roblox.com/en-us/articles/Data-store#metadata-1)
	 * of a DataStore key belonging to the profile. The way this table is saved
	 * is equivalent to using
	 * `DataStoreSetOptions:SetMetadata(Profile.RobloxMetadata)` and passing the
	 * `DataStoreSetOptions` object to a `:SetAsync()` call, except changes will
	 * truly get saved on the next auto-update cycle or when the profile is
	 * released. The periodic saving and saving upon releasing behavior is
	 * identical to that of `Profile.Data` - After the profile is released
	 * further changes to this value will not be saved.
	 *
	 * **Be cautious of very harsh limits for maximum Roblox Metadata size - As
	 * of writing this, total table content size cannot exceed 300
	 * characters.**.
	 *
	 * @example
	 *
	 * ```ts
	 * const profile; // A profile object you loaded
	 *
	 * // Mimicking the Roblox hub example:
	 * profile.RobloxMetadata = { ExperienceElement: "Fire" };
	 *
	 * // You can read from it and write to it at will:
	 * print(profile.RobloxMetadata.ExperienceElement);
	 * profile.RobloxMetadata.ExperienceElement = undefined;
	 * profile.RobloxMetadata.UserCategory = "Casual";
	 *
	 * // I think setting it to a whole table at profile load would
	 * //  be more safe considering the size limit for meta data
	 * //  is pretty tight:
	 * profile.RobloxMetadata = {
	 * 	UserCategory: "Casual",
	 * 	FavoriteColor: [1, 0, 0],
	 * };
	 * ```
	 */
	public readonly RobloxMetadata: RobloxMetadata;

	/**
	 * User ids associated with this profile. Entries must be added with
	 * [Profile:AddUserId()](https://madstudioroblox.github.io/ProfileService/api/#profileadduserid)
	 * and removed with
	 * [Profile:RemoveUserId()](https://madstudioroblox.github.io/ProfileService/api/#profileremoveuserid).
	 */
	public readonly UserIds: ReadonlyArray<number>;

	// eslint-disable-next-line camelcase -- loleris L
	protected _view_mode: boolean;

	/**
	 * Associates a `UserId` with the profile. Multiple users can be associated
	 * with a single profile by calling this method for each individual
	 * `UserId`. The primary use of this method is to comply with GDPR (The
	 * right to erasure). More information in [official
	 * documentation](https://developer.roblox.com/en-us/articles/Data-store#metadata-1).
	 *
	 * The right time to call this method can be seen in the [basic usage
	 * example](https://madstudioroblox.github.io/ProfileService/tutorial/basic_usage/).
	 *
	 * @param userId - The UserId to add to the Profile.
	 */
	public AddUserId(userId: number): void;

	/**
	 * **Only works for profiles loaded through
	 * [.ViewProfileAsync()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreviewprofileasync)
	 * or
	 * [.ProfileVersionQuery()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreprofileversionquery)**.
	 *
	 * Clears all global update data (active or locked) for a profile payload.
	 * It may be desirable to clear potential "residue" global updates (e.g.
	 * Pending gifts) which were existing in a snapshot which is being used to
	 * recover player data through
	 * [:ProfileVersionQuery()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreprofileversionquery).
	 */
	public ClearGlobalUpdates(): void;

	/** Destroys the Profile's Janitor. */
	public Destroy(): void;

	/**
	 * Equivalent of `Profile.Metadata.Metatags.get(tagName)`.
	 *
	 * @param tagName - The tag name to retrieve.
	 * @returns The value of the metatag or `undefined` if it doesn't exist.
	 * @see {@linkcode Profile.SetMetatag} for more info.
	 */
	public GetMetatag(tagName: string): unknown;

	/**
	 * Returns a string containing DataStore name, scope and key; Used for
	 * debugging.
	 *
	 * Example return: `"[Store:"GameData";Scope:"Live";Key:"Player_2312310"]"`.
	 *
	 * @returns A string containing the DataStore name, scope, and key.
	 */
	public Identify(): string;

	/**
	 * Returns `true` while the profile is session-locked and saving of changes
	 * to {@linkcode Data} is guaranteed.
	 *
	 * @returns Whether the profile is active.
	 */
	public IsActive(): boolean;

	/**
	 * In many cases ProfileService will be fast enough when loading and
	 * releasing profiles as the player teleports between places belonging to
	 * the same universe / game. However, if you're experiencing noticeable
	 * delays when loading profiles after a universe teleport, you should try
	 * implementing `.ListenToHopReady()`.
	 *
	 * A listener passed to `.ListenToHopReady()` will be executed after the
	 * releasing UpdateAsync call finishes. `.ListenToHopReady()` will usually
	 * call the listener in around a second, but may occasionally take up to 7
	 * seconds when a profile is released next to an auto-update interval
	 * (regular usage scenario - rapid loading / releasing of the same profile
	 * key may yield different results).
	 *
	 * **Example Use:**.
	 *
	 * @example
	 *
	 * ```ts
	 * const TeleportService = game.GetService("TeleportService");
	 * let profile;
	 * let player;
	 * let placeId;
	 *
	 * profile.Release();
	 * profile.ListenToHopReady(() => {
	 * 	TeleportService.TeleportAsync(placeId, [player]);
	 * });
	 * ```
	 *
	 * In short, `Profile:ListenToRelease()` and `Profile:ListenToHopReady()`
	 * will both execute the listener function after release, but
	 * `Profile:ListenToHopReady()` will additionally wait until the session
	 * lock is removed from the `Profile`.
	 *
	 * @param listener - The listener to execute after the releasing UpdateAsync
	 *   call finishes.
	 * @returns The RBXScriptConnection for the listener.
	 */
	public ListenToHopReady(listener: () => void): RBXScriptConnection;

	/**
	 * Listener functions subscribed to `Profile.ListenToRelease()` will be
	 * called when the profile is released remotely (Being `"ForceLoad"`'ed on a
	 * remote server) or locally (`Profile.Release()`). In common practice, the
	 * profile will rarely be released before the player leaves the game so it's
	 * recommended to simply
	 * [.Kick()](https://developer.roblox.com/en-us/api-reference/function/Player/Kick)
	 * the Player when this happens.
	 *
	 * You cannot modify `Profile.Data` once this has been triggered.
	 *
	 * @param listener - The listener to execute after the releasing UpdateAsync
	 *   call finishes.
	 * @returns The RBXScriptConnection for the listener.
	 */
	public ListenToRelease(listener: (placeId?: number, jobId?: string) => void): RBXScriptConnection;

	/**
	 * **Only works for profiles loaded through
	 * [:ViewProfileAsync()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreviewprofileasync)
	 * or
	 * [:ProfileVersionQuery()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreprofileversionquery)**.
	 *
	 * Using this method for editing latest player data when the player is
	 * in-game can lead to several minutes of lost progress - it should be
	 * replaced by
	 * [.LoadProfileAsync()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreloadprofileasync)
	 * which will wait for the next live profile auto-save if the player is
	 * in-game, allowing the remote server to release the profile and save
	 * latest data.
	 *
	 * Pushes the `Profile` payload to the DataStore (saves the profile) and
	 * releases the session lock for the profile.
	 */
	public Overwrite(): void;

	/**
	 * A non-blocking version of {@linkcode Overwrite}.
	 *
	 * @returns A promise that resolves when the operation is complete.
	 */
	public OverwriteAsync(): Promise<void>;

	/**
	 * Stores the value into `Profile.Data`. This is how you now store data into
	 * the profile. This does not fire any events.
	 *
	 * @param key - The key to store the value in.
	 * @param value - The value to store.
	 */
	public RawSet<Key extends keyof DataType>(key: Key, value: DataType[Key]): void;

	/**
	 * Stores the value into `Profile.Data` following a path. This is how you
	 * now store data into the profile. This does not fire any events.
	 *
	 * @param path - The path to the object from the data table. This is a dot
	 *   separated string.
	 * @param value - The value to store.
	 */
	public RawSetToPath<P extends Paths<DataType>>(path: P, value: PathToValue<DataType, P>): void;

	/**
	 * Similar to {@linkcode Update}, except does not fire the
	 * `Profile.DataUpdated` event.
	 *
	 * @param callback - The callback function that receives the current data
	 *   and returns the new data or void.
	 */
	// biome-ignore lint/suspicious/noConfusingVoidType: I do not care bro
	public RawUpdate(callback: (currentData: DeepWritable<DataType>) => DataType | void): void;

	/**
	 * Fills in missing variables inside `Profile.Data` from `profileTemplate`
	 * table that was provided when calling `ProfileService.GetProfileStore()`.
	 * It's often necessary to use `.Reconcile()` if you're applying changes to
	 * your `profileTemplate` over the course of your game's development after
	 * release.
	 *
	 * The right time to call this method can be seen in the [basic usage
	 * example](https://madstudioroblox.github.io/ProfileService/tutorial/basic_usage/).
	 *
	 * The following function is used in the reconciliation process:.
	 *
	 * ```lua
	 * local function ReconcileTable(target, template)
	 * 	for k, v in pairs(template) do
	 *    	if type(k) == "string" then -- Only string keys will be reconciled
	 *        	if target[k] == nil then
	 *            	if type(v) == "table" then
	 *                	target[k] = DeepCopyTable(v)
	 *            	else
	 *                	target[k] = v
	 *            	end
	 *        	elseif type(target[k]) == "table" and type(v) == "table" then
	 *            	ReconcileTable(target[k], v)
	 *        	end
	 *    	end
	 * 	end
	 * end
	 * ```
	 */
	public Reconcile(): void;

	/**
	 * Removes the session lock for this profile for this Roblox server. Call
	 * this method after you're done working with the `Profile` object. Profile
	 * data will be immediately saved for the last time.
	 */
	public Release(): void;

	/**
	 * Disassociates `UserId` with the profile if it was initially associated.
	 *
	 * @param userId - The UserId to remove from the Profile.
	 */
	public RemoveUserId(userId: number): void;

	/**
	 * Call `Profile.Save()` to quickly progress `GlobalUpdates` state or to
	 * speed up the propagation of `Profile.Metadata.Metatags` changes to
	 * `Profile.Metadata.MetatagsLatest`.
	 *
	 * Should **not** be called for saving `Profile.Data` or
	 * `Profile.Metadata.Metatags` - this is already done for you
	 * automatically.
	 *
	 * Do not call when the profile has been released.
	 */
	public Save(): void;

	/**
	 * A non-blocking version of {@linkcode Save}.
	 *
	 * @returns A promise that resolves when the operation is complete.
	 */
	public SaveAsync(): Promise<void>;

	/**
	 * Stores the value into `Profile.Data`. This is how you now store data into
	 * the profile.
	 *
	 * @param key - The key to store the value in.
	 * @param value - The value to store.
	 */
	public Set<Key extends keyof DataType>(key: Key, value: DataType[Key]): void;

	/**
	 * Equivalent of `Profile.Metadata.Metatags.set(tagName, value)`.
	 *
	 * Useful for tagging your profile with information about itself such as.
	 *
	 * - DataVersion to let your code know whether `Profile.Data` needs anything
	 *   converted after massive changes to the game.
	 * - Anything set through `profile.SetMetatag(tagName, tagValue)` will be
	 *   available through `profile.Metadata.MetatagsLatest.get(tagName)` after
	 *   an auto-save or a `.Save()` call - `Profile.Metadata.MetatagsLatest` is
	 *   a version of `Profile.Metadata.Metatags` that has been successfully
	 *   saved to the DataStore.
	 *
	 * You cannot call this method after a profile has been released.
	 *
	 * @param tagName - The name of the metatag to set on the profile.
	 * @param value - Any value supported by DataStores.
	 */
	public SetMetatag(tagName: string, value: unknown): void;

	/**
	 * Stores the value into `Profile.Data` following a path. This is how you
	 * now store data into the profile.
	 *
	 * @param path - The path to the object from the data table. This is a dot
	 *   separated string.
	 * @param value - The value to store.
	 */
	public SetToPath<P extends Paths<DataType>>(path: P, value: PathToValue<DataType, P>): void;

	/**
	 * Stores the attribute into the Profile's Data table when the attribute
	 * changes.
	 *
	 * @deprecated I would avoid this function. Attributes are unreliable.
	 * @param name - The name of the attribute / the key in the Data table.
	 * @param object - The Instance to store from.
	 * @returns The RBXScriptConnection for the change event.
	 */
	public StoreOnAttributeChange(name: string, object: Instance): RBXScriptConnection;

	/**
	 * Stores the Value of ValueObject into the Profile's Data table when the
	 * ValueObject changes.
	 *
	 * @param name - The name of the value in the Data table.
	 * @param valueObject - The ValueObject to store from.
	 * @returns The RBXScriptConnection for the change event.
	 */
	public StoreOnValueChange(name: string, valueObject: ValueBase): RBXScriptConnection;

	/**
	 * Stores the attribute into the Profile's Data table when the attribute
	 * changes.
	 *
	 * @deprecated I would avoid this function. Attributes are unreliable.
	 * @param path - The path to the object from the data table. This can be a
	 *   dot separated string or an array of strings.
	 * @param object - The Instance to store from.
	 * @returns The RBXScriptConnection for the change event.
	 */
	public StoreToPathOnAttributeChange(path: Array<string> | string, object: Instance): RBXScriptConnection;

	/**
	 * Stores the Value of ValueObject into the Profile's Data table when the
	 * ValueObject changes.
	 *
	 * @param path - The path to the object from the data table. This can be a
	 *   dot separated string or an array of strings.
	 * @param valueObject - The ValueObject to store from.
	 */
	public StoreToPathOnValueChange(path: Array<string> | string, valueObject: ValueBase): RBXScriptConnection;

	/**
	 * Stores the attribute into the Profile's Data table when the attribute
	 * changes.
	 *
	 * @deprecated I would avoid this function. Attributes are unreliable.
	 * @param name - The name of the attribute / the key in the Data table.
	 * @param tableName - The name of the table that contains the attribute.
	 * @param object - The Instance to store from.
	 * @returns The RBXScriptConnection for the change event.
	 */
	public StoreToTableOnAttributeChange(name: string, tableName: string, object: Instance): RBXScriptConnection;

	/**
	 * Stores the Value of ValueObject into the Profile's Data table when the
	 * ValueObject changes.
	 *
	 * @param name - The name of the value in the Data table.
	 * @param tableName - The name of the table that contains the value.
	 * @param valueObject - The ValueObject to store from.
	 * @returns The RBXScriptConnection for the change event.
	 */
	public StoreToTableOnValueChange(name: string, tableName: string, valueObject: ValueBase): RBXScriptConnection;

	/**
	 * Behaves in a similar way to what {@linkcode DataStore.UpdateAsync} would
	 * do. The `callback` function is called immediately with the current value
	 * of `Profile.Data` and is expected to return the new value of
	 * `Profile.Data` or `void` to leave it unchanged. If the `callback`
	 * function errors, the update is aborted and will be retried during the
	 * next auto-update cycle.
	 *
	 * This method will fire the `Profile.DataUpdated` event if the data was
	 * changed.
	 *
	 * @param callback - The callback function that receives the current data
	 *   and returns the new data or void.
	 */
	// biome-ignore lint/suspicious/noConfusingVoidType: I do not care bro
	public Update(callback: (currentData: DeepWritable<DataType>) => DataType | void): void;

	protected constructor();
}

export declare class ProfileStore<T extends object, RobloxMetadata = unknown> {
	/**
	 * `ProfileStore.Mock` is a reflection of methods available in the
	 * `ProfileStore` object with the exception of profile operations being
	 * performed on profiles stored on a separate, detached "fake" DataStore
	 * that will be forgotten when the game session ends. You may load profiles
	 * of the same key from `ProfileStore` and `ProfileStore.Mock` in parallel.
	 * These will be two different profiles because the regular and mock
	 * versions of the same `ProfileStore` are completely isolated from each
	 * other.
	 *
	 * `ProfileStore.Mock` is useful for customizing your testing environment in
	 * cases when you want to [enable Roblox API
	 * services](https://developer.roblox.com/en-us/articles/Data-store#using-data-stores-in-studio)
	 * in studio, but don't want ProfileService to save to live keys.
	 *
	 * @example
	 *
	 * ```ts
	 * const RunService = game.GetService("RunService")
	 * let GameProfileStore = ProfileService.GetProfileStore("PlayerData", ProfileTemplate)
	 * if (RunService:IsStudio() === true) {
	 * 	GameProfileStore = GameProfileStore.Mock
	 * }
	 * ```
	 *
	 * A few more things:
	 *
	 * - Even when Roblox API services are disabled, `ProfileStore` and
	 *   `ProfileStore.Mock` will store profiles in separate stores.
	 * - It's better to think of `ProfileStore` and `ProfileStore.Mock` as two
	 *   different ProfileStore objects unrelated to each other in any way.
	 * - It's possible to create a project that utilizes both live and mock
	 *   profiles on live servers!
	 *
	 *
	 * @example
	 *
	 * ```ts
	 * const ProfileTemplate = {};
	 * const GameProfileStore = ProfileStore.GetProfileStore(
	 * 	"PlayerData",
	 * 	ProfileTemplate,
	 * );
	 *
	 * const LiveProfile = GameProfileStore.LoadProfileAsync(
	 * 	"profile_key",
	 * 	"ForceLoad",
	 * );
	 * const MockProfile = GameProfileStore.Mock.LoadProfileAsync(
	 * 	"profile_key",
	 * 	"ForceLoad",
	 * );
	 * print(LiveProfile !== MockProfile); // --> true
	 *
	 * // When done using mock profile on live servers: (Prevent memory leak)
	 * MockProfile.Release();
	 * GameProfileStore.Mock.WipeProfileAsync("profile_key");
	 * // You don't really have to wipe mock profiles in studio testing
	 * ```
	 */
	public readonly Mock: ProfileStore<T, RobloxMetadata>;

	/**
	 * Used to create and manage `Active` global updates for a specified
	 * `Profile`. Can be called on any Roblox server of your game. Updates
	 * should reach the recipient in less than 30 seconds, regardless of whether
	 * it was called on the same server the `Profile` is session-locked to. See
	 * [Global
	 * Updates](https://madstudioroblox.github.io/ProfileService/api/#global-updates)
	 * for more information.
	 *
	 * `:GlobalUpdateProfile()` will work for profiles that haven't been created
	 * (profiles are created when they're loaded using `:LoadProfileAsync()` for
	 * the first time).
	 *
	 * **Yielding inside the `update_handler` function will throw an error**.
	 *
	 * **Avoid rapid use of ProfileStore:GlobalUpdateProfile()** Excessive use
	 * of
	 * [ProfileStore:GlobalUpdateProfileAsync()](https://madstudioroblox.github.io/ProfileService/api/#profilestoreglobalupdateprofileasync)
	 * can lead to dead session locks and event lost `Profile.Data` (latter is
	 * mostly possible only if the `Profile` is loaded in the same session as
	 * `:GlobalUpdateProfileAsync()` is called). This is due to a queue system
	 * that executes every write request for the `Profile` every 7 seconds - if
	 * this queue grows larger than the [BindToClose
	 * timeout](https://developer.roblox.com/en-us/api-reference/function/DataModel/BindToClose)
	 * (approx. 30 seconds), some requests in the queue can be lost after the
	 * game shuts down.
	 *
	 * @example
	 *
	 * ```ts
	 * ProfileStore.GlobalUpdateProfile(
	 * 	"Player_2312310",
	 * 	(globalUpdates) => {
	 * 		globalUpdates.AddActiveUpdate({
	 * 			Type: "AdminGift",
	 * 			Item: "Coins",
	 * 			Amount: 1000,
	 * 		});
	 * 	},
	 * );
	 * ```
	 *
	 * @param profileKey - DataStore key.
	 * @param updateHandler - This function is called with a GlobalUpdates
	 *   object.
	 * @returns A {@linkcode GlobalUpdates} object or `undefined` if not found.
	 */
	public GlobalUpdateProfile(profileKey: string, updateHandler: GlobalUpdateHandler): GlobalUpdates | undefined;

	/**
	 * A non-blocking version of {@linkcode GlobalUpdateProfile}.
	 *
	 * @param profileKey - DataStore key.
	 * @param updateHandler - This function is called with a GlobalUpdates
	 *   object.
	 * @returns A promise that resolves with a {@linkcode GlobalUpdates} object
	 *   or `undefined` if not found.
	 */
	public GlobalUpdateProfileAsync(
		profileKey: string,
		updateHandler: GlobalUpdateHandler,
	): Promise<GlobalUpdates | undefined>;

	/**
	 * For basic usage, do not pass anything for the `notReleasedHandler`
	 * argument.
	 *
	 * `notReleasedHandler` as a `function` argument is called when the profile
	 * is session-locked by a remote Roblox server:.
	 *
	 * @example
	 *
	 * ```ts
	 * const profile = ProfileStore.LoadProfile(
	 * 	"Player_2312310",
	 * 	(placeId, gameJobId) => {
	 * 		// placeId and gameJobId identify the Roblox server that has
	 * 		// this profile currently locked. In rare cases, if the server
	 * 		// crashes, the profile will stay locked until ForceLoaded by
	 * 		// a new session.
	 * 		return "Repeat" || "Cancel" || "ForceLoad" || "Steal";
	 * 	},
	 * );
	 * ```
	 *
	 * @param profileKey - DataStore key.
	 * @param notReleasedHandler - Called when the profile is session-locked by
	 *   a remote Roblox server. Must return one of the follow values.
	 *
	 *   - `"Repeat"` - ProfileService will repeat the profile loading process and
	 *       may call the release handler again
	 *   - `"Cancel"` - `.LoadProfileAsync()` will immediately return nil
	 *   - `"ForceLoad"` - ProfileService will indefinitely attempt to load the
	 *       profile. If the profile is session-locked by a remote Roblox
	 *       server, it will either be released for that remote server or
	 *       "stolen" (Stealing is necessary for remote servers that are not
	 *       responding in time and for handling crashed server session-locks).
	 *   - `"Steal"` - The profile will usually be loaded immediately, ignoring an
	 *       existing remote session lock and applying a session lock for this
	 *       session. `"Steal"` can be used to clear dead session locks faster
	 *       than `"ForceLoad"` assuming your code knows that the session lock
	 *       is dead.
	 *
	 * @returns A {@linkcode Profile} object or `undefined` if not found.
	 */
	public LoadProfile(
		profileKey: string,
		notReleasedHandler?: "ForceLoad" | "Steal" | NotReleasedHandler,
	): Profile<T, RobloxMetadata> | undefined;

	/**
	 * For basic usage, do not pass anything for the `notReleasedHandler`
	 * argument.
	 *
	 * `notReleasedHandler` as a `function` argument is called when the profile
	 * is session-locked by a remote Roblox server:.
	 *
	 * @example
	 *
	 * ```ts
	 * ProfileStore.LoadProfileAsync(
	 * 	"Player_2312310",
	 * 	(placeId, gameJobId) => {
	 * 		// placeId and gameJobId identify the Roblox server that has
	 * 		// this profile currently locked. In rare cases, if the server
	 * 		// crashes, the profile will stay locked until ForceLoaded by
	 * 		// a new session.
	 * 		return "Repeat" || "Cancel" || "ForceLoad" || "Steal";
	 * 	},
	 * ).andThen((profile) => {});
	 * ```
	 *
	 * @param profileKey - DataStore key.
	 * @param notReleasedHandler - Called when the profile is session-locked by
	 *   a remote Roblox server. Must return one of the follow values:
	 *
	 *   - `"Repeat"` - ProfileService will repeat the profile loading process and
	 *       may call the release handler again
	 *   - `"Cancel"` - `.LoadProfileAsync()` will immediately return nil
	 *   - `"ForceLoad"` - ProfileService will indefinitely attempt to load the
	 *       profile. If the profile is session-locked by a remote Roblox
	 *       server, it will either be released for that remote server or
	 *       "stolen" (Stealing is necessary for remote servers that are not
	 *       responding in time and for handling crashed server session-locks).
	 *   - `"Steal"` - The profile will usually be loaded immediately, ignoring an
	 *       existing remote session lock and applying a session lock for this
	 *       session. `"Steal"` can be used to clear dead session locks faster
	 *       than `"ForceLoad"` assuming your code knows that the session lock
	 *       is dead.
	 *
	 * @returns A Promise that resolves with either {@linkcode Profile} object or
	 *   `undefined` if not found.
	 */
	public LoadProfileAsync(
		profileKey: string,
		notReleasedHandler?: "ForceLoad" | "Steal" | NotReleasedHandler,
	): Promise<Profile<T, RobloxMetadata> | undefined>;

	/**
	 * Creates a profile version query using [DataStore:ListVersionsAsync()
	 * (Official
	 * documentation)](https://developer.roblox.com/en-us/api-reference/function/DataStore/ListVersionsAsync).
	 * Results are retrieved through `ProfileVersionQuery:Next()`. For
	 * additional help, check the [versioning example in official Roblox
	 * documentation](https://developer.roblox.com/en-us/articles/Data-store#versioning-1).
	 * Date definitions are easier with the [DateTime (Official
	 * documentation)](https://developer.roblox.com/en-us/api-reference/datatype/DateTime)
	 * library. User defined day and time will have to be converted to [Unix
	 * time (Wikipedia)](https://en.wikipedia.org/wiki/Unix_time) while taking
	 * their timezone into account to expect the most precise results, though
	 * you can be rough and just set the date and time in the UTC timezone and
	 * expect a maximum margin of error of 24 hours for your query results.
	 *
	 * **Examples of query arguments:**.
	 *
	 * - Pass `nil` for `sort_direction`, `min_date` and `max_date` to find the
	 *   oldest available version
	 * - Pass `Enum.SortDirection.Descending` for `sort_direction`, `nil` for
	 *   `min_date` and `max_date` to find the most recent version.
	 * - Pass `Enum.SortDirection.Descending` for `sort_direction`, `nil` for
	 *   `min_date` and `DateTime` **defining a time before an event** (e.g. Two
	 *   days earlier before your game stole 1,000,000 rubies from a player) for
	 *   `max_date` to find the most recent version of a `Profile` that existed
	 *   before said event.
	 *
	 * **Case example: "I lost all of my rubies on August 14th!"**.
	 *
	 * ```ts
	 * // Get a ProfileStore object with the same arguments you passed to the
	 * //   ProfileStore that loads player Profiles. It can also just be
	 * //   the very same ProfileStore object:
	 *
	 * const profileStore = ProfileService.GetProfileStore("Profiles", {});
	 *
	 * // If you can't figure out the exact time and timezone the player lost rubies
	 * //  in on the day of August 14th, then your best bet is to try querying
	 * //  UTC August 13th. If the first entry still doesn't have the rubies -
	 * //  try a new query of UTC August 12th and etc.
	 *
	 * // UTC August 13th, 2021
	 * const maxDate = DateTime.fromUniversalTime(2021, 8, 13);
	 *
	 * const query = profileStore.ProfileVersionQuery(
	 * 	"Player_2312310", // The same profile key that gets passed to .LoadProfileAsync()
	 * 	Enum.SortDirection.Descending,
	 * 	undefined,
	 * 	maxDate,
	 * );
	 *
	 * // Get the first result in the query:
	 * const profile = query.Next();
	 *
	 * if (profile !== undefined) {
	 * 	profile.ClearGlobalUpdates();
	 *
	 * 	profile.Overwrite(); // This method does the actual rolling back;
	 * 	// Don't call this method until you're sure about setting the latest
	 * 	// version to a copy of the previous one
	 *
	 * 	print("Rollback success!");
	 *
	 * 	print(profile.Data); // You'll be able to surf table contents if
	 * 	// you're running this code in studio with access to API services
	 * 	// enabled and have expressive output enabled; If the printed data
	 * 	// doesn't have the rubies, you'll want to change your
	 * 	// query parameters.
	 * } else print("No version to rollback to");
	 * ```
	 *
	 * ** Case example: Studying data mutation over time**
	 *
	 * ```typescript
	 * // You have ProfileService working in your game. You join
	 * // the game with your own account and go to https://www.unixtimestamp.com
	 * // and save the current UNIX timestamp resembling present time.
	 * // You can then make the game alter your data by giving you
	 * // currency, items, experience, etc.
	 *
	 * const profileStore = ProfileService.GetProfileStore("StoreName", {});
	 *
	 * // UNIX timestamp you saved:
	 * const minDate = DateTime.fromUnixTimestamp(1628952101);
	 * // Print the next 5 minutes of history.
	 * const printMinutes = 5;
	 *
	 * const query = profileStore.ProfileVersionQuery(
	 * 	"Player_2312310",
	 * 	Enum.SortDirection.Ascending,
	 * 	minDate,
	 * );
	 *
	 * // You can now attempt to print out every snapshot of your data saved
	 * // at an average periodic interval of 30 seconds (ProfileService auto-save)
	 * // starting from the time you took the UNIX timestamp!
	 *
	 * const finishUpdateTime =
	 * 	minDate.UnixTimestampMillis + printMinutes * 60000;
	 * print("Fetching ", printMinutes, "minutes of saves:");
	 *
	 * let entryCount = 0;
	 * while (true) {
	 * 	entryCount += 1;
	 * 	const profile = query.Next();
	 * 	if (profile !== undefined) {
	 * 		if (profile.KeyInfo.UpdatedTime > finishUpdateTime) {
	 * 			if (entryCount === 1)
	 * 				print(
	 * 					"No entries found in set time period. (Start timestamp too early)",
	 * 				);
	 * 			else print("Time period finished.");
	 * 			break;
	 * 		}
	 *
	 * 		print(
	 * 			"Entry",
	 * 			entryCount,
	 * 			"-",
	 * 			DateTime.fromUnixTimestampMillis(
	 * 				profile.KeyInfo.UpdatedTime,
	 * 			).ToIsoDate(),
	 * 		);
	 * 		print(profile.Data); // Printing table for studio expressive output
	 * 	} else {
	 * 		if (entryCount === 1)
	 * 			print(
	 * 				"No entries found in set time period. (Start timestamp too late)",
	 * 			);
	 * 		else print("No more entries in query.");
	 * 		break;
	 * 	}
	 * }
	 * ```
	 *
	 * @param profileKey - The key that uniquely identifies the profile in the
	 *   DataStore.
	 * @param sortDirection - The direction to sort queries.
	 * @param minDate - The minimum date to scan profile versions for.
	 * @param maxDate - The maximum date to scan profile versions for.
	 * @returns A query object for fetching profile versions.
	 */
	public ProfileVersionQuery(
		profileKey: string,
		sortDirection?: Enum.SortDirection,
		minDate?: DateTime | number,
		maxDate?: DateTime | number,
	): ProfileVersionQuery<T, RobloxMetadata>;

	/**
	 * Attempts to load the latest profile version (or a specified version via
	 * the `version` argument) from the DataStore without claiming a session
	 * lock. Returns `nil` if such version does not exist. Returned `Profile`
	 * will not auto-save and releasing won't do anything. Data in the returned
	 * `Profile` can be changed to create a payload which can be saved via
	 * [Profile:OverwriteAsync()](https://madstudioroblox.github.io/ProfileService/api/#profileoverwriteasync).
	 *
	 * **Passing version argument in mock mode (Or offline mode) will throw an
	 * error - Mock versioning is not supported**.
	 *
	 * @param profileKey - DataStore key.
	 * @param version - DataStore key version.
	 * @returns A profile object or undefined if not found. This one will be
	 *   view only.
	 */
	public ViewProfile(profileKey: string, version?: string): Profile<T, RobloxMetadata> | undefined;

	/**
	 * A non-blocking version of {@linkcode ViewProfile}.
	 *
	 * @param profileKey - The key that uniquely identifies the profile in the
	 *   DataStore.
	 * @param version - The version of the profile to view.
	 * @returns A promise that is resolved with profile object or undefined if
	 *   not found. This one will be view only.
	 */
	public ViewProfileAsync(profileKey: string, version?: string): Promise<Profile<T, RobloxMetadata> | undefined>;

	/**
	 * Use `.WipeProfile()` to erase user data when complying with right of
	 * erasure requests. In live Roblox servers `.WipeProfile()` must be used on
	 * profiles created through `ProfileStore.Mock` after `Profile.Release()`
	 * and it's known that the `Profile` will no longer be loaded again.
	 *
	 * @param profileKey - The key to wipe.
	 * @returns If the wipe was successful or not.
	 */
	public WipeProfile(profileKey: string): boolean;

	/**
	 * A non-blocking version of {@linkcode WipeProfile}.
	 *
	 * @param profileKey - The key to wipe.
	 * @returns A promise that resolves to true if the wipe was successful, or
	 *   false if it failed.
	 */
	public WipeProfileAsync(profileKey: string): Promise<boolean>;

	protected constructor();
}
