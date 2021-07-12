import "mocha";
import {assert} from "chai";
import {DateParser} from "../main/models";

describe("DateParser", () => {
    context("Parses strings into Date values", () => {
        it("Parses an empty string as undefined", () => {
            assert.isUndefined(new DateParser().parse(""), "Empty strings must result in undefined");
        });
        it("Parses a null string as null", () => {
            assert.isNull(new DateParser().parse("null"), "'null' strings must result in null");
        });
        it("Parses a Date string as a Date instance", () => {
            assert.instanceOf(new DateParser().parse("2021-01-01"), Date, "Date instance must be returned");
        });
        it("Parses the 'now' literal as a new Date", () => {
            assert.instanceOf(new DateParser().parse("now"), Date, "Date instance must be returned");
        });
    });
});
