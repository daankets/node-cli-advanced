/**
 * Methods required for logging, compatible with console.Console
 */
export interface IConsole {
    debug(message?: unknown, ...optionalParams: unknown[]): void;

    log(message?: unknown, ...optionalParams: unknown[]): void;

    info(message?: unknown, ...optionalParams: unknown[]): void;

    warn(message?: unknown, ...optionalParams: unknown[]): void;

    error(message?: unknown, ...optionalParams: unknown[]): void;
}
