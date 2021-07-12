import {IArgumentParser} from "./IArgumentParser";
import {TRequired} from "./TRequired";

/**
 * This interface is the model for a single declared argument, and used for declaring a new argument.
 */
export interface IArgument<T> {
    /**
     * The name of the argument to declare, and the key for the parsed argument map. Must be unique.
     */
    name: string,
    /**
     * Either a class implementing IArgumentParser<T> or an instance of IArgumentParser<T>. In the first case,
     * new instances will be created as needed.
     */
    parser?: (new () => IArgumentParser<T>) | IArgumentParser<T>,
    /**
     * Indicates if the argument is required. If this value is a callback function, the resolved arguments will be
     * passed in as a Map<string,any> for testing, before the required values are evaluated.
     */
    required?: TRequired,
    /**
     * Indicates that the argument is a flag, and therefore needs no value:
     * ({@code --someFlag} instead of {@code --someFlag true}).
     * The value is boolean and optional by default.
     */
    flag?: boolean,
    array?: boolean,
    shortCode?: string,
    position?: number | boolean,
    defaultValue?: T | null,
    pattern?: RegExp,
    description?: string,

    // parse(input: string): T
}
