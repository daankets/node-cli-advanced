import "mocha";
import {assert} from "chai";
import {IntParser, NumberParser} from "../main/models";

describe("NumberParser", () => {
    context("Parses strings into Number values", () => {
        it("Parses an empty string as undefined", () => {
            assert.isUndefined(new NumberParser().parse(""), "Empty strings must result in undefined");
        });
        it("Parses a null string as null", () => {
            assert.isNull(new NumberParser().parse("null"), "'null' strings must result in null");
        });
        it("Parses an int string as an integer value", () => {
            assert.equal(new IntParser().parse("123"), 123, "Must be a safe integer");
        });
        it("Parses an float string as a float value", () => {
            assert.equal(new NumberParser().parse("123.123"), 123.123, "Must parse a float");
        });
    });
});
