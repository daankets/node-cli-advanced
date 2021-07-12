/**
 * The interface for an argument parser - a utility that parses a string argument into the desired target type.
 * This package comes with a set of default parsers for various types.
 */
export interface IArgumentParser<T> {
    /**
     * Parse the provided string value, and return either
     * - null (null string),
     * - undefined (empty string),
     * - the resultant value of type <T>
     * @param value The string value to parse
     */
    parse(value: string): T | null | undefined;

    /**
     * Returns the name of the target type. Can be anything, should correspond to T.
     */
    name: string;
}
