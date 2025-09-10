import type { ViewProfile } from "./globals";

declare class ProfileVersionQuery<T extends object, RobloxMetadata = unknown> {
	/**
	 * Retrieves the next Profile available.
	 *
	 * @returns The next Profile or undefined if not found.
	 */
	public Next(): undefined | ViewProfile<T, RobloxMetadata>;

	/**
	 * Retrieves the next Profile available. This is a non-blocking version of
	 * {@linkcode Next}.
	 *
	 * @returns A promise that resolves with the next Profile or undefined if
	 *   not found.
	 */
	public NextAsync(): Promise<undefined | ViewProfile<T, RobloxMetadata>>;

	private constructor();
}

export default ProfileVersionQuery;
