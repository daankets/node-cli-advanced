import {IArgumentParser} from "./IArgumentParser";

export class ObjectParser implements IArgumentParser<Object> {
    public readonly name = "Object";

    parse(value: string): Object | null | undefined {
        switch (value.trim()) {
            case "":
                return undefined;
            case "null":
                return null;
            default:
                return JSON.parse(value);
        }
    }
}
