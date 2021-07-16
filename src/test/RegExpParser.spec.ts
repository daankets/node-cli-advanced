import "mocha";
import {assert} from "chai";
import {Command} from "../main/models";
import {RegExpParser} from "../main/parsers";

describe("RegExpParser", () => {
	it("Can parse undefined from an empty string", () => {
		assert.isUndefined(new RegExpParser().parse(""), "Empty string must be undefined");
	});
	it("Can parse null from a 'null' string", () => {
		assert.isNull(new RegExpParser().parse("null"), "Null string must be null");
	});
	it("Can parse without flags", () => {
		assert.deepEqual(new RegExpParser().parse("^abc$"), /^abc$/, "Must match");
	});
	it("Can parse with flags", () => {
		assert.deepEqual(new RegExpParser().parse("/^abc$/ig"), /^abc$/ig, "Must match");
		assert.isTrue(new RegExpParser().parse("/^abc$/ig")?.global, "Global flag must match");
		assert.isTrue(new RegExpParser().parse("/^abc$/ig")?.ignoreCase, "Case insensitive flag must match");
	});
})
