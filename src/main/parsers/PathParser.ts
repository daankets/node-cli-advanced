import {IArgumentParser} from "../models/IArgumentParser";
import * as Path from "path";
import {ParsedPath} from "path";

export class PathParser implements IArgumentParser<ParsedPath> {
    public parse(arg: string): ParsedPath | null | undefined {
        switch (arg.trim().toLowerCase()) {
            case "null":
                return null;
            case "":
                return undefined;
        }
        return Path.parse(arg);
    }

    public readonly name = "ParsedPath";
}
