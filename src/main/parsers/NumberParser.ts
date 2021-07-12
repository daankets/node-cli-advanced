import {IArgumentParser} from "../models";

export class NumberParser implements IArgumentParser<number> {
    public readonly name = "number";

    constructor(private readonly mode: "int" | "float" = "float") {

    }

    parse(value: string): number | null | undefined {
        switch (value.trim().toLowerCase()) {
            case "":
                return undefined;
            case "null":
                return null;
            default:
                if (this.mode === "int" && value.includes(".")) {
                    throw new Error("Not an integer value");
                }
                return Number.parseFloat(value);
        }
    }
}
