import type { ViewProfile } from "./globals";

export default interface ProfileVersionQuery<T extends object, RobloxMetadata = unknown> {
	/** Retrieves the next Profile available. */
	Next(): undefined | ViewProfile<T, RobloxMetadata>;
	NextAsync(): Promise<undefined | ViewProfile<T, RobloxMetadata>>;
}
