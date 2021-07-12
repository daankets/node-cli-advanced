import {IArgumentParser} from "../models";

export class BooleanParser implements IArgumentParser<boolean> {
    public parse(arg: string): boolean | null | undefined {
        switch (arg.trim().toLowerCase()) {
            case "null":
                return null;
            case "":
                return undefined;
            case "0":
            case "false":
            case "no":
                return false;
            case "true":
            case "1":
            case"yes":
                return true;
            default:
                throw new Error("Invalid boolean");
        }
    }

    public readonly name = "Boolean";
}
