import {IArgumentParser} from "../models/IArgumentParser";

export class EnumParser<T extends string | number> implements IArgumentParser<T> {

    public constructor(protected readonly enumeration: { [key: string]: T }, public readonly name = "enum") {
    }

    parse(value: string): T | null | undefined {
        // noinspection FallThroughInSwitchStatementJS
        switch (value.trim().toLowerCase()) {
            case "":
                return undefined;
            case "null":
                return null;
            default:
                if (!this.enumeration[value] === undefined) {
                    throw new Error(`No value named ${value}`);
                }
                return this.enumeration[value];
        }
    }

}
