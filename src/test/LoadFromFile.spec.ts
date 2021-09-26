import "mocha";
import {assert} from "chai";
import {Command} from "../main";
import path from "node:path";

describe("Loading from a file", () => {
	const aCommand = new Command("test")
		.addArgument({name: "a"})
		.addArgument({name: "b"})
		.addArgument<number>({name: "c"});

	it("Can load the config from any object", () => {
		const config = {
			test: {
				a: "Hello,",
				b: "world!",
				c: 123
			}
		};
		const instance = aCommand.loadFromObject(config);
		assert.equal(instance.args.get("a"), "Hello,");
		assert.equal(instance.args.get("b"), "world!");
		assert.equal(instance.args.get("c"), 123);
	});

	it("Can load the config from any file", async function () {
		const instance = await aCommand.loadFromFile(path.join(__dirname, "test.json"), (data) => JSON.parse(data));
		assert.equal(instance.args.get("a"), "Hello,");
		assert.equal(instance.args.get("b"), "world!");
		assert.equal(instance.args.get("c"), 123);
	});
});
