import "mocha";
import {assert} from "chai";
import {BooleanParser} from "../main/models";

describe("BooleanParser", () => {
    context("Parses strings into Boolean values", () => {
        it("Parses an empty string as undefined", () => {
            assert.isUndefined(new BooleanParser().parse(""), "Empty strings must result in undefined");
        });
        it("Parses a null string as null", () => {
            assert.isNull(new BooleanParser().parse("null"), "'null' strings must result in null");
        });
        it("Parses yes, true and 1 as true, regardless of case", () => {
            ["yes", "YES", "yEs", "True", "TRUE", "true", "1"]
                .map((s) => new BooleanParser().parse(s))
                .forEach((v) => assert.isTrue(v, "Must be true"));

        });
        it("Parses no, false and 0 as false, regardless of case", () => {
            ["no", "NO", "nO", "No", "FALSE", "false", "faLSe", "0"]
                .map((s) => new BooleanParser().parse(s))
                .forEach((v) => assert.isFalse(v, "Must be false"));

        });
        it("Throws on invalid boolean values", () => {
            try {
                new BooleanParser().parse("banana");
                assert.fail("Must never reach this point");
            } catch (error) {
                assert.instanceOf(error, Error, "Must throw an error");
            }
        })
    });
});
