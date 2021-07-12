import {IArgumentParser} from "../models";

export class ObjectParser<T> implements IArgumentParser<T> {
    public readonly name = "object";

    parse(value: string): T | null | undefined {
        switch (value.trim()) {
            case "":
                return undefined;
            case "null":
                return null;
            default:
                return JSON.parse(value) as T;
        }
    }
}
