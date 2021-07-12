import {IArgumentParser} from "./IArgumentParser";

export class DateParser implements IArgumentParser<Date> {
    public readonly name = "Date";

    public parse(arg: string): Date | null | undefined {
        arg = arg.trim();
        switch (arg) {
            case "":
                return undefined;
            case "null":
                return null;
            case "now":
                return new Date();
        }
        const r = new Date(arg);

        if (isNaN(r.getTime()) || !isFinite(r.getTime())) {
            throw new Error("Not a valid Date");
        }

        return r;
    }
}
