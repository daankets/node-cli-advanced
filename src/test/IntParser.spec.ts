import "mocha";
import {assert} from "chai";
import {IntParser} from "../main/models";

describe("IntParser", () => {
    context("Parses strings into integral Number values", () => {
        it("Parses an empty string as undefined", () => {
            assert.isUndefined(new IntParser().parse(""), "Empty strings must result in undefined");
        });
        it("Parses a null string as null", () => {
            assert.isNull(new IntParser().parse("null"), "'null' strings must result in null");
        });
        it("Parses an int string as an integer value", () => {
            assert.isTrue(Number.isSafeInteger(new IntParser().parse("123")), "Must be a safe integer");
        });
        it("Throws on float values", () => {
            try {
                new IntParser().parse("123.123")
            } catch (error) {
                assert.instanceOf(error, Error, "Must throw an error");
            }
        });
    });
});
