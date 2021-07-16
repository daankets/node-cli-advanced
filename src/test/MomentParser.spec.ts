import "mocha";
import {assert} from "chai";
import {MomentParser} from "../main/parsers";
import moment from "moment";

describe("MomentParser", () => {
	context("Parses strings into Moment instances", () => {
		it("Parses an empty string as undefined", () => {
			assert.isUndefined(new MomentParser().parse(""), "Empty strings must result in undefined");
		});
		it("Parses a null string as null", () => {
			assert.isNull(new MomentParser().parse("null"), "'null' strings must result in null");
		});
		it("Parses a Date string as a Moment instance", () => {
			assert.instanceOf(new MomentParser().parse("2021-01-01"), moment, "Moment instance must be returned");
		});
		it("Parses the literals as Moment instances", () => {
			for (const literal of ["now","today","yesterday","tomorrow"]) {
				assert.instanceOf(new MomentParser().parse(literal), moment, "Moment instance must be returned");
			}
		});
	});
});
