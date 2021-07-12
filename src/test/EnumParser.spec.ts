import "mocha";
import {assert} from "chai";
import {EnumParser} from "../main/parsers/EnumParser";
import {Command} from "../main/models";

enum Demo1 {
    some = "Some",
    value = "Value"
}

enum Demo2 {
    alpha,
    beta
}

describe("EnumParser", () => {
    it("Can parse values from a string enum", () => {
        assert.equal(new EnumParser(Demo1).parse("some"), Demo1.some, "Must match enum value");
    });
    it("Can parse values from a numerical enum", () => {
        assert.equal(new EnumParser(Demo2).parse("alpha"), Demo2.alpha, "Must match enum value");
    });
    it("Will reject values that don't match the enum", () => {
        try {
            assert.equal(new EnumParser(Demo2).parse("other"), Demo2.alpha, "Must match enum value");
            assert.fail("Must not reach this point");
        } catch (error) {
            assert.instanceOf(error, Error, "An error must be thrown");
        }
    });
    it("Can be passed directly to the argument", () => {
        const command = new Command("demo").addArgument({
            name: "demo1",
            parser: new EnumParser(Demo1)
        });
        const instance = command.parse(false, "--demo1", "some");
        assert.equal(instance.get<Demo1>("demo1"), Demo1.some, "Must match enum valu");
    });
    it("Can be extended and passed as a class to the argument", () => {
        class Demo1Parser extends EnumParser<Demo1> {
            constructor() {
                super(Demo1);
            }
        }

        const command = new Command("demo").addArgument({
            name: "demo1",
            parser: Demo1Parser
        });
        const instance = command.parse(false, "--demo1", "some");
        assert.equal(instance.get<Demo1>("demo1"), Demo1.some, "Must match enum valu");
    });
})
