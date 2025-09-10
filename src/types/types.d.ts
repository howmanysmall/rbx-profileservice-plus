/* eslint-disable ts/no-unnecessary-type-parameters -- stupid lint */

import type { Paths } from "./advanced-types";

export interface UpdateResult<DataType extends object> {
	readonly Changed: boolean;
	readonly Count: number;
	readonly Paths: ReadonlyArray<Paths<DataType>>;
}

/**
 * A connect-only signal.
 *
 * @template ConnectedFunctionSignature The function signature for connected
 *   functions.
 * @template Generic If `true`, the signal is generic and can connect functions
 *   with any signature. If `false`, the signal is non-generic and can only
 *   connect functions matching `ConnectedFunctionSignature`. Defaults to
 *   `false`.
 */
export declare class ScriptSignal<
	ConnectedFunctionSignature extends (...signalArguments: ReadonlyArray<never>) => void = () => void,
	Generic extends boolean = false,
> {
	/**
	 * Whether or not to do a warning when a thread is suspended when
	 * {@linkcode DisconnectAll} is called. By default it is `false`.
	 */
	public DebugMode: boolean;

	/**
	 * Connects a function to the signal, which will be called anytime the
	 * signal is fired.
	 *
	 * @param callback - The function to connect to the signal.
	 * @returns A connection object.
	 */
	public Connect<O extends Array<unknown> = Parameters<ConnectedFunctionSignature>>(
		callback: Generic extends true
			? Parameters<ConnectedFunctionSignature> extends Array<unknown>
				? (...signalArguments: O) => void
				: ConnectedFunctionSignature
			: ConnectedFunctionSignature,
	): RBXScriptConnection;

	/**
	 * Connects a function to the signal, which will be called the next time the
	 * signal fires. Once the connection is triggered, it will disconnect
	 * itself.
	 *
	 * @deprecated Use {@linkcode Once} instead.
	 * @param callback - The function to connect to BindableEvent.Event.
	 */
	public ConnectOnce<O extends Array<unknown> = Parameters<ConnectedFunctionSignature>>(
		callback: Generic extends true
			? Parameters<ConnectedFunctionSignature> extends Array<unknown>
				? (...signalArguments: O) => void
				: ConnectedFunctionSignature
			: ConnectedFunctionSignature,
	): RBXScriptConnection;

	/**
	 * Disconnect all handlers. Since we use a linked list it suffices to clear
	 * the reference to the head handler.
	 */
	public DisconnectAll(): void;

	/**
	 * Gets all the connections in the signal.
	 *
	 * @returns An array of all active connections to the signal.
	 */
	public GetConnections(): Array<RBXScriptConnection>;

	/**
	 * Checks if there are any active connections in the signal.
	 *
	 * @returns Whether or not there are any active connections in the signal.
	 */
	public IsConnectedTo(): boolean;

	/**
	 * Connects a function to the signal, which will be called the next time the
	 * signal fires. Once the connection is triggered, it will disconnect
	 * itself.
	 *
	 * @param callback - The function to connect to the signal.
	 */
	public Once<O extends Array<unknown> = Parameters<ConnectedFunctionSignature>>(
		callback: Generic extends true
			? Parameters<ConnectedFunctionSignature> extends Array<unknown>
				? (...signalArguments: O) => void
				: ConnectedFunctionSignature
			: ConnectedFunctionSignature,
	): RBXScriptConnection;

	/** Yields the current thread until the thread is fired. */
	public Wait(): LuaTuple<Parameters<ConnectedFunctionSignature>>;

	private constructor();
}
