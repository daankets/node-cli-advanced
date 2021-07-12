import {IArgumentParser} from "../models/IArgumentParser";

export class StringParser implements IArgumentParser<string> {

    public constructor(protected readonly allowNull: boolean = true) {

    }

    public readonly name = "string";

    parse(value: string): string | null | undefined {
        // noinspection FallThroughInSwitchStatementJS
        switch (value.trim().toLowerCase()) {
            case "":
                return undefined;
            case "null":
                if (this.allowNull) {
                    return null;
                }
				return value;
            default:
                return value;
        }
    }

}
