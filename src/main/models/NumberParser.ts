import {IArgumentParser} from "./IArgumentParser";

export class NumberParser implements IArgumentParser<Number> {
    public readonly name = "Number";

    constructor(private readonly mode: "int" | "float" = "float") {

    }

    parse(value: string): Number | null | undefined {
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
