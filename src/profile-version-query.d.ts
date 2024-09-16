import type { ViewProfile } from "./globals";

export default interface ProfileVersionQuery<T extends object, RobloxMetadata = unknown> {
	/**
	 * Retrieves the next Profile available.
	 */
	Next(): ViewProfile<T, RobloxMetadata> | undefined;
	NextAsync(): Promise<ViewProfile<T, RobloxMetadata> | undefined>;
}
