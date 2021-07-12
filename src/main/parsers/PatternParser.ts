import {IArgumentParser} from "../models/IArgumentParser";
import {StringParser} from "./StringParser";

export class PatternParser extends StringParser implements IArgumentParser<string> {

    public constructor(protected readonly pattern:RegExp, protected readonly allowNull: boolean = true) {
        super(allowNull);
    }

    public readonly name = "string";

    parse(value: string): string | null | undefined {
        const input = super.parse(value);
        if (input && !this.pattern.test(input)) {
            throw new Error(`Input ${input} does not match pattern ${this.pattern}`);
        }
        return input;
    }

}
