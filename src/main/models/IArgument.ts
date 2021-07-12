import {IArgumentParser} from "./IArgumentParser";
import {TRequired} from "./TRequired";

export interface IArgument<T> {
    name: string,
    parser?: (new () => IArgumentParser<T>),
    required?: TRequired,
    flag?: boolean,
    array?: boolean,
    shortCode?: string,
    position?: number | Boolean,
    defaultValue?: T | null,
    pattern?: RegExp,
    description?: string,

    // parse(input: string): T
}
