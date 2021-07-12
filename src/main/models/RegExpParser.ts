import {IArgumentParser} from "./IArgumentParser";
const PARSE_PATTERN = /(\/?)(.+)\1([a-z]*)/;

export class RegExpParser implements IArgumentParser<RegExp> {
    public readonly name = "RegExp";

    parse(value: string): RegExp | null | undefined {
        switch (value.trim().toLowerCase()) {
            case "":
                return undefined;
            case "null":
                return null;
            default:
                if (!PARSE_PATTERN.test(value)) {
                    throw new Error("Not a valid regular expression");
                }
                const parsed = value.match(PARSE_PATTERN);
                if (parsed) {
                    return new RegExp(parsed[2],parsed[3]);
                }
        }
    }
}
