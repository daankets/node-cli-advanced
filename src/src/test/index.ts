import "mocha";
import {assert} from "chai";
import {BooleanParser, Command, DateParser} from "../../main/models/Command";

describe("A Command", () => {
    context("Required arguments", () => {
        it("Can have static required arguments", () => {
            const testCommand = new Command<void>("test");
            testCommand.param({
                name: "test",
                required: true,
                description: "Always required"
            });
            try {
                const instance = testCommand.parse();
                assert.fail("Must not succeed");
            } catch (error) {
                assert.equal(error.message, "Missing required fields: test")
            }
        });

        it("Can have dynamically required arguments", () => {
            const testCommand = new Command<void>("test");
            testCommand.param({
                name: "test1",
                required: (args) => !args?.get("test2"),
                description: "Required if test2 is not specified"
            });
            testCommand.param({
                name: "test2",
                required: (args) => !args?.get("test1"),
                description: "Required if test1 is not specified"
            });


            const instance1 = testCommand.parse(false, "--test1", "Hello,");
            assert.equal(instance1.args.get("test1"), "Hello,")
            const instance2 = testCommand.parse(false, "--test2", "world!");
            assert.equal(instance2.args.get("test2"), "world!")

            try {
                testCommand.parse(false);
                assert.fail("Must not succeed");
            } catch (error) {
                assert.equal(error.message, "Missing required fields: test1, test2")
            }
        });
    });
    context("Argument types", () => {
        it("Accepts Boolean arguments", () => {
            const command = new Command("test")
                .param<Boolean>({
                    name: "test",
                    parser: BooleanParser
                });
            const instance = command.parse(false,"--test","false");
            assert.equal(instance.args.get("test"),false);
        });
        it("Accepts Date arguments", () => {
            const command = new Command("test")
                .param<Date>({
                    name: "test",
                    parser: DateParser
                });
            const instance = command.parse(false,"--test","2021-01-01");
            assert.instanceOf(instance.args.get("test"),Date);
        });
    });
});
