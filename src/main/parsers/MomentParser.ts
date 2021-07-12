import {IArgumentParser} from "../models/IArgumentParser";
import moment, {Moment} from "moment";

export class MomentParser implements IArgumentParser<Moment> {
    public readonly name = "Moment";

    public parse(arg: string): Moment | null | undefined {
        arg = arg.trim();
        switch (arg) {
            case "":
                return undefined;
            case "null":
                return null;
            case "now":
                return moment();
            case "today":
                return moment().startOf("day");
            case "tomorrow":
                return moment().add(1, "day").startOf("day");
            case "yesterday":
                return moment().subtract(1, "day").startOf("day");
        }
        const r = moment(arg);

        if (!r.isValid()) {
            throw new Error("Not a valid moment");
        }

        return r;
    }
}
