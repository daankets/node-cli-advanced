import "mocha";
import {assert} from "chai";
import {IntParser, NumberParser, ObjectParser} from "../main/parsers";

describe("ObjectParser", () => {
    context("Object strings into object instances", () => {
        it("Parses an empty string as undefined", () => {
            assert.isUndefined(new ObjectParser().parse(""), "Empty strings must result in undefined");
        });
        it("Parses a null string as null", () => {
            assert.isNull(new ObjectParser().parse("null"), "'null' strings must result in null");
        });
        it("Parses a JSON string as an integer value", () => {
            assert.deepEqual(new ObjectParser().parse("{\"hello\":\"world\"}"), {hello:"world"}, "Must be an equal object");
        });
    });
});
