import "mocha";
import {assert} from "chai";
import {PatternParser} from "../main/parsers/PatternParser";
import {Command} from "../main/models";

const IP_V4_ADDRESS_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

describe("PatternParser", () => {
    it("Can parse values from a string", () => {
        assert.equal(new PatternParser(IP_V4_ADDRESS_PATTERN).parse("10.0.0.1"), "10.0.0.1", "Must match IP");
    });
    it("Will reject values that don't match the pattern", () => {
        try {
            new PatternParser(IP_V4_ADDRESS_PATTERN).parse("1.2.3");
            assert.fail("Must not reach this point");
        } catch (error) {
            assert.instanceOf(error, Error, "An error must be thrown");
        }
    });
    it("Can be passed directly to the argument", () => {
        const command = new Command("demo").addArgument({
            name: "demo1",
            parser: new PatternParser(IP_V4_ADDRESS_PATTERN)
        });
        const instance = command.parse(false, "--demo1", "192.168.0.1");
        assert.equal(instance.get<string>("demo1"), "192.168.0.1", "Must match IP");
    });
    it("Can be extended and passed as a class to the argument", () => {
        class IPAddressParser extends PatternParser {
            constructor() {
                super(IP_V4_ADDRESS_PATTERN);
            }
        }

        const command = new Command("demo").addArgument({
            name: "demo1",
            parser: IPAddressParser
        });
        const instance = command.parse(false, "--demo1", "192.168.0.2");
        assert.equal(instance.get<string>("demo1"), "192.168.0.2", "Must match IP");
    });
})
