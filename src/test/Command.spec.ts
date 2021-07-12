import "mocha";
import {assert} from "chai";
import {Command, IntParser} from "../main/models";
import {BooleanParser, MomentParser, NumberParser} from "../main/models";
import {DateParser} from "../main/models";

describe("A Command", () => {
    context("Required arguments", () => {
        it("Can have static required arguments", () => {
            const testCommand = new Command<void>("test");
            testCommand.addArgument({
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
            testCommand.addArgument({
                name: "test1",
                required: (args) => !args?.get("test2"),
                description: "Required if test2 is not specified"
            });
            testCommand.addArgument({
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
                .addArgument<Boolean>({
                    name: "test",
                    parser: BooleanParser
                });
            const instance = command.parse(false, "--test", "false");
            assert.equal(instance.args.get("test"), false);
        });
        it("Accepts Date arguments", () => {
            const command = new Command("test")
                .addArgument<Date>({
                    name: "test",
                    parser: DateParser
                });
            const instance = command.parse(false, "--test", "2021-01-01");
            assert.instanceOf(instance.args.get("test"), Date);
        });
        it("Accepts integral Number arguments", () => {
            const command = new Command("test")
                .addArgument<Number>({
                    name: "test",
                    parser: NumberParser
                });
            const instance = command.parse(false, "--test", "12345");
            assert.equal(instance.args.get("test"), 12345);
        });
        it("Accepts decimal Number arguments", () => {
            const command = new Command("test")
                .addArgument<Number>({
                    name: "test",
                    parser: NumberParser
                });
            const instance = command.parse(false, "--test", "123.45");
            assert.equal(instance.args.get("test"), 123.45);
        });
        it("Can be restricted to Int arguments", () => {
            const command = new Command("test")
                .addArgument<Number>({
                    name: "test",
                    parser: IntParser
                });
            try {
                command.parse(false, "--test", "123.45");
                assert.fail("Must never reach this point");
            } catch (error) {
                assert.instanceOf(error, Error, "Must be an error");
            }
        });
    });
    context("Arrays", () => {
        it("Can parse comma-separated arguments as arrays", () => {
            const command = new Command("test")
                .addArgument<Number>({
                    name: "test1",
                    parser: NumberParser,
                    array: true
                })
                .addArgument<Boolean>({
                    name: "test2",
                    parser: BooleanParser,
                    array: true
                });
            const instance = command.parse(
                false,
                "--test1", "123,234.5,0,null,",
                "--test2", "true,FALSE,yes,null,No,"
            );
            assert.deepEqual(instance.args.get("test1"), [123, 234.5, 0, null, undefined]);
            assert.deepEqual(instance.args.get("test2"), [true, false, true, null, false, undefined]);
        });
    });
});
