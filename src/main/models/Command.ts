"use strict";
import {IArgumentParser} from "./IArgumentParser";
import {BooleanParser} from "../parsers";
import {IArgument} from "./IArgument";
import {ICommandOptions} from "./ICommandOptions";
import {readFile} from "fs/promises";

/**
 * This 80-spaces are used as a fast means for padding strings.
 * @type {string}
 */
const SPACES = "                                                                                ";

/**
 * Model for a command line. The ability for adding parameters, default values, required or not required, parameter
 * types and flags. Also has a help feature.
 */
class CommandArgument<T> implements IArgument<T> {
	private readonly $array: boolean = false;
	private readonly $name: string;
	private readonly $flag: boolean = false;
	private readonly $parser?: (new() => IArgumentParser<T>) | IArgumentParser<T>;
	private readonly $required: boolean | ((params?: Map<string, unknown>) => boolean) = true;
	private readonly $defaultValue: T | null;
	private readonly $shortCode?: string;
	private readonly $position?: number;
	private readonly $description?: string;
	private readonly $pattern?: RegExp;

	/**
	 * Constructs a new command parameter.
	 * @param name {string} The name of the parameter, to be used like --<name> in the command line
	 * @param type? {Function(function)} A constructor function that takes a string, defaults to String
	 * @param required? {boolean|function(args:object)} Indicates if the field is required; may be a function that
	 * takes the already resolved arguments as an argument, and that returns a boolean. Used for conditionally
	 * required fields.
	 * @param flag? {boolean} Indicates if this fields is a boolean flag. Boolean flags are optional and default to
	 * false.
	 * @param shortCode? {string} Specifies a shortcode (like 'x' for 'extract'), to be used like -<shortcode> in the
	 * command line.
	 * @param position? {number} Indicates that this argument is positional. It is still possible to use the
	 * argument in the --<name> variant as well, but this will shift other positional parameters.
	 * @param description? {string} Optional help description, shown when command is stringified using toString();
	 * @param array? {boolean} Indicates that an argument can take multiple values, separated by comma (and optionally
	 * a comma+space if quoted)
	 * @param defaultValue? {any} An optional default value. Set to false automatically for flag parameters
	 * @param pattern {RegExp|String} Regular expression for parameter
	 */
	constructor({name, parser, required = false, flag = false, shortCode, position, description, array = false, defaultValue = null, pattern}: IArgument<T>
	) {

		// Name is required
		if (!name) {
			throw new Error("Invalid param name");
		}
		this.$name = name;

		// Check if the short code is valid
		if (shortCode && shortCode.length > 1 && "\"'-?*$".indexOf(shortCode) === -1) {
			throw new Error("Invalid shortcode");
		}

		/* Check if the type of the flag is Boolean
		if (flag && type !== T) {
			throw new Error("Flags must be boolean");
		}*/

		// Check if the required field is off for flags
		if (flag && required) {
			throw new Error("Flags can't be required");
		}

		this.$array = array && true || false;
		this.$flag = flag || false;
		this.$parser = parser;
		this.$required = flag ? false : (required === false ? false : required);
		this.$shortCode = shortCode;
		this.$position = position as number;
		this.$description = description;
		this.$defaultValue = defaultValue;
		this.$pattern = pattern && new RegExp(pattern);
	}

	get name() {
		return this.$name;
	}

	get defaultValue(): T | null {
		return this.$defaultValue;
	}

	get array() {
		return this.$array;
	}

	get shortCode() {
		return this.$shortCode;
	}

	get position() {
		return this.$position;
	}

	get description() {
		return this.$description;
	}

	get flag() {
		return this.$flag;
	}

	get pattern() {
		return this.$pattern;
	}

	get required() {
		return this.$required;
	}

	isRequired(args?: Map<string, unknown>): boolean {
		if (typeof this.$required === "function") {
			return this.$required.call(this, args);
		}
		return this.$required;
	}

	get parser() {
		return this.$parser;
	}

	getParser(): IArgumentParser<T> | undefined {
		if (this.$parser && (typeof this.$parser === "function")) {
			return new this.$parser() as IArgumentParser<T>;
		} else if (this.$parser && typeof this.$parser === "object") {
			return this.$parser as IArgumentParser<T>;
		}
	}

	get type(): string {
		return this.getParser()?.name || "string";
	}

	get positional() {
		return typeof this.$position === "number";
	}

	/**
	 * Parses the string value, by passing it on to the type constructor. In case of array type parameters,
	 * splits the string value upon every unescaped space.
	 *
	 * @param stringValue? {string} string input to be parsed
	 * @return {*}
	 */
	parse(stringValue: string) {
		if (this.$array) {
			return stringValue && stringValue.length && stringValue
				// This regex is actually valid and working ;-)
				.split(/(?<!\\), ?/g)
				.map((part) => {
					part = part && part.replace(/\\,/g, ","); // Unescape escaped commas
					if (part && this.pattern && !this.pattern.test(part)) {
						throw new Error(
							`Value '${part}' does not match pattern ${this.pattern} for property '${this.name}'`
						);
					}
					return part;
				})
				.map((part) => {
					return this.autoConvert(part);
				});
		}

		if (stringValue && this.$pattern && !this.$pattern.test(stringValue)) {
			throw new Error(
				`Value '${stringValue}' does not match pattern ${this.pattern} for property '${this.name}'`
			);
		}
		return this.autoConvert(stringValue);
	}

	/**
	 * Converts non-primitive built-in types to their primitive variant. This is for compatibility, and  due to
	 * several utilities doing type checking on primitive values only.
	 * @param value {string} Any type.
	 * @return {string|boolean|number|object|undefined} Not non-primitive String, Boolean or Number.
	 */
	autoConvert(value: string): undefined | T | null {
		if (this.$parser) {
			return this.getParser()?.parse(value);
		}
		return value as unknown as T;
	}
}

/**
 * A command is a model for a command line, with the added feature of parsing an effective command line into parts.
 * The command class can handle:
 * --name <value> Named parameters with a value
 * [--optional <value>] Named optional parameters
 * [--flag] Named (always optional) flags
 * copy <sourceFile> <targetFolder> [<targetFileName>] Positional parameters, both required and optional
 * ls -a Short codes for longer named flags or paramterers --verbose --> -v
 * --multi "<value1,value2, value\,3,value4>" Array-type parameters (multi-value) with escaping of the delimiter
 * and quoting for spaces.
 * The class can parse the process arguments as well as a varargs array or normal array.
 * Default values for certain parameters
 * Fixed and conditional validation of required parameters
 * A command can explain itself using toString()
 * Typing of arguments to any constructor that takes a string as input, like Moment.
 * strict/non-strict mode (ignores unknown arguments)
 */
export class Command<R> {
	private $params: Map<string, CommandArgument<unknown>> = new Map<string, CommandArgument<unknown>>();
	private $positionals = 0;
	private $lastPositional?: string;
	private $info?: string;
	$execute?: (args: Map<string, unknown>) => Promise<R>;

	/**
	 * Constructs a new command.
	 *
	 * @param name The name of the command
	 * @param options? Options, like strict and console.
	 */
	constructor(public readonly name: string, readonly options: ICommandOptions = {strict: true, logger: console}) {
		this.addArgument({
			name: "help",
			shortCode: "?",
			parser: BooleanParser,
			flag: true,
			description: "Print this help information"
		});
	}


	/**
	 * Add a parameter to this command
	 *
	 * @param name {string}
	 * @param type? {Function} Constructor function, String by default
	 * @param required? {Boolean|function(object)} False if not required, or a function that evaluates to a boolean
	 * @param shortCode? {String} 1-character string, to be used as shortcode
	 * @param flag? {Boolean} Flag field if try (no value, boolean type)
	 * @param position? {boolean} True if positional, position is calculated by order of adding parameters
	 * @param description {string} Description for help
	 * @param array {boolean} True when the param of array type (multi-value, comma-separated)
	 * @param defaultValue {any} Default value in the target type
	 * @param pattern {RegExp|string} Regular expression to match before parsing
	 *
	 * @return {Command} This command instance.
	 */
	addArgument<T>({
		name,
		parser,
		required = true,
		shortCode,
		flag = false,
		position,
		description,
		array = false,
		defaultValue = null,
		pattern
	}: IArgument<T>): this {

		if (!name) {
			throw new Error("Invalid param name");
		}

		if (this.getParameterByName(name)) {
			throw new Error(`Duplicated named param ${name}`);
		}

		if (shortCode && this.getParameterByShortCode(shortCode)) {
			throw new Error(`Duplicated short code ${shortCode}`);
		}

		if (position && this.options?.strict === false) {
			this.options?.logger?.warn("Positional arguments are ignored in a non-strict command");
			return this;
		}

		if (position && required && this.$lastPositional) {
			throw new Error(
				"There already is a previous optional positional parameter '" +
				this.$lastPositional +
				"'. No new required positional argument are possible."
			);
		}
		const param = new CommandArgument<T>({
			name,
			parser: flag ? (BooleanParser as unknown as new () => IArgumentParser<T>) : parser,
			required: flag ? false : required,
			flag: flag === true,
			shortCode,
			position: position && this.$positionals++,
			description,
			array,
			defaultValue: flag ? (false as unknown as T) : defaultValue,
			pattern
		});
		this.$params.set(name, param);


		if (param.positional && !param.required) {
			this.$lastPositional = param.name;
		}

		return this;
	}

	/**
	 * Documents the command as a string for the console. This will output the info of the command, an example
	 * command line and the parameters.
	 *
	 * @return {string} Info
	 */
	toString(): string {
		const help = this.name;
		const params = Array.from(this.parameters).map((param: CommandArgument<unknown>) => {
			const p = [];
			let s;
			if (!param.position) {
				p.push("--" + param.name);
			}
			if (!param.flag) {
				p.push("<" + param.name + ">");
			}
			s = p.join(" ");
			if (param.array) {
				if (s.endsWith("s>")) {
					s = s.substr(0, s.length - 2) + ">";
				}
				s += ", ...";
			}
			if (!param.required) {
				return `[${s}]`;
			}
			return s;
		});
		const maxNameLength = Command.getMaxStringLength(Object.keys(this.$params));
		const maxTypeLength = Command.getMaxStringLength(
			Array.from(this.parameters).map(param => param.parser?.name || "string")
		);
		return (this.$info ? (this.$info + "\n\n") : "") + [help].concat(params).join(" ") + "\n\n" +
			Array
				.from(this.parameters)
				.map(param => {
					return "\t--" + Command.rightPad(param.name, maxNameLength) +
						"\t" + Command.rightPad(param.flag ? "Flag" : param.type +
							(param.array ? "[]" : ""), maxTypeLength + 2) +
						(param.description ? (" - " + param.description + ".") : "") +
						(param.defaultValue !== null ? (" Defaults to " + JSON.stringify(param.defaultValue) + ".") : "") +
						(param.pattern ? ` Must match ${param.pattern}.` : "");
				})
				.join("\n");
	}

	/**
	 * Returns a parameter by name
	 *
	 * @param name {string} The name of the parameter to retrieve
	 * @param verify? {boolean} Throw if not found
	 * @param ignoreStrict {boolean} ignore strict mode
	 * @return {CommandArgument} Command parameter or undefined
	 */
	getParameterByName<T>(name: string, verify = false, ignoreStrict = false): CommandArgument<T> {
		const param = this.$params.get(name) as CommandArgument<T>;
		if (!param && verify && this.options?.strict && !ignoreStrict) {
			throw new Error(`Unknown named parameter '${name}'`);
		}
		return param;
	}

	/**
	 * Retrieves a paramter by short code
	 *
	 * @param shortCode {string} Single-char shortcode of the parameter to retrieve
	 * @param verify? {boolean} Throw if not found
	 * @param ignoreStrict {boolean} ignore strict mode
	 * @return {CommandArgument} Command parameter or undefined
	 */
	getParameterByShortCode<T>(shortCode: string, verify = false, ignoreStrict = false): CommandArgument<T> {
		const param =
			Array
				.from(this.parameters)
				.find(param => param.shortCode === shortCode) as CommandArgument<T>;
		if (!param && verify && this.options?.strict && !ignoreStrict) {
			throw new Error(`Unknown short code '${shortCode}'`);
		}
		return param;
	}

	/**
	 * Retrieves a positional parameter by position
	 *
	 * @param position {number} The parameter position
	 * @param verify? {boolean} Throw if not found
	 * @param ignoreStrict {boolean} ignore strict mode
	 * @return {CommandArgument} Command parameter or undefined
	 */
	getParameterByPosition(position: number, verify = false, ignoreStrict = false): CommandArgument<unknown> | undefined {
		const param = Array
			.from(this.parameters)
			.find((param) => param.position === position);
		if (!param && verify && this.options?.strict && !ignoreStrict) {
			throw Object.assign(
				new Error(`Unknown positional parameter ${position}`),
				{position: position}
			);
		}
		return param;
	}

	/**
	 * Parse the process.argv, ignoring the first 2 elements (path and script).
	 * Then return a command instance
	 * @param ignoreStrict {boolean} ignore strict mode
	 * @param noThrow? {boolean} Does not throw in case of a parsing error, but prints an error message, and triggers
	 * help.
	 * @return {CommandInstance} A command instance
	 */
	parseProcessArgs(ignoreStrict = false, noThrow = false): CommandInstance<R> {
		return this.parseArray(ignoreStrict, process.argv.slice(2), noThrow);
	}

	/**
	 * Load the configuration from an object, which could be read from any config file.
	 * @param data The config object to read from
	 * @param options The options: The first key on the config to read from (group)
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	loadFromObject(data: any, options?: { sectionName?: string }): CommandInstance<R> {
		const section = data[options?.sectionName || this.name];
		const args = [];
		for (const key in section) {
			const value = section[key];
			args.push(`--${key}`);
			if (value !== null && value !== undefined) {
				args.push(`${section[key]}`);
			}
		}
		return this.parseArray(false, args);
	}

	/**
	 * Load the arguments from a file, reading it, converting it to string using the specified encoding, and then parsing it using the provided parser.
	 * @param path The path to the file to load
	 * @param parser Ther parser to conver the string into an object
	 * @param options The encoding nd sectionName.
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	async loadFromFile(path: string, parser: (data: string) => any, options?: { encoding?: BufferEncoding, sectionName?: string }): Promise<CommandInstance<R>> {
		const data = parser(await readFile(path, {encoding: options?.encoding || "utf-8"}));
		return this.loadFromObject(data, options);
	}

	/**
	 * Parses the provided arguments array, returning a command instance.
	 *
	 * @param ignoreStrict {boolean} ignore strict mode
	 * @param args {string[]} The array of arguments to parse
	 * @param noThrow? {boolean} Does not throw in case of a parsing error, but prints an error message, and triggers
	 * help.
	 * @return {CommandInstance} A command instance.
	 */
	parseArray(ignoreStrict = false, args: string[], noThrow = false): CommandInstance<R> {
		try {
			return this.parse(ignoreStrict, ...args);
		} catch (error) {
			if (noThrow) {
				this.options?.logger?.error(error.message);
				return new CommandInstance<R>(this, new Map<string, unknown>().set("help", true), args);
			}
			throw error;
		}
	}

	/**
	 * Return an array of IArgument
	 * @return {IArgument[]}
	 */
	get parameters(): IterableIterator<CommandArgument<unknown>> {
		return this.$params.values();
	}

	parse(ignoreStrict = false, ...args: string[]): CommandInstance<R> {
		const resolvedArguments = new Map<string, unknown | null>();
		// Build required arguments
		Array.from(this.parameters)
			.filter((param) => param.defaultValue !== undefined) // TODO Daan: Conditionally required params are not initialized with default values
			.forEach((param) => {
				resolvedArguments.set(param.name, param.defaultValue);
			});

		let nextPosition = 0;
		let nextParam: CommandArgument<unknown> | null;
		args.forEach((argument) => {
			if (argument.startsWith("--")) {
				// Named, full style
				const paramName = argument.substr(2);
				nextParam = this.getParameterByName(paramName, true, ignoreStrict);
				if (nextParam && nextParam.flag) {
					resolvedArguments.set(nextParam.name, true);
					nextParam = null;
				}
				return;
			} else if (argument.startsWith("-")) {
				// Named, shorthand style
				const shortCode = argument.substr(1);
				nextParam = this.getParameterByShortCode(shortCode, true, ignoreStrict);
				if (nextParam && nextParam.flag) {
					resolvedArguments.set(nextParam.name, true);
					nextParam = null;
				}
				return;
			} else if (nextParam) {
				// Value for next param!
				resolvedArguments.set(nextParam.name, nextParam.parse(argument));
				nextParam = null;
				return;
			}
			// Next positional!
			let param;
			try {
				param = this.getParameterByPosition(nextPosition++, true, ignoreStrict);
				if (!param) {
					return;
				}
			} catch (error) {
				throw new Error(`Can't resolve positional argument ${error.position} (${argument})`);
			}

			resolvedArguments.set(param.name, param.parse(argument));

		});

		if (resolvedArguments.get("help") === true) {
			return new CommandInstance<R>(this, new Map<string, unknown>().set("help", true), args);
		}

		/**
		 * Check if there are missing required fields, and add the names into an array.
		 * @type {Array} Collector array for the missing fields
		 */
		const missingRequiredFields = Array
			.from(this.parameters)
			.filter(param => param.isRequired(resolvedArguments))
			.filter(param => [undefined, null].includes(resolvedArguments.get(param.name) as never))
			.map(missingParam => missingParam.name);

		if (missingRequiredFields.length) {
			throw new Error(`Missing required fields: ${missingRequiredFields.join(", ")}`);
		}

		return new CommandInstance(this, resolvedArguments, args);
	}

	/**
	 * Get the max length of a set of strings
	 * @param strings
	 * @return {number}
	 */
	private static getMaxStringLength(strings: string[]) {
		return strings.reduce((last, next) => {
			return Math.max(last, next.length);
		}, 0);
	}

	/**
	 * Pads a string s with spaces, up to length.
	 * @param s {string} The string to pad
	 * @param length {number} The result length after padding
	 * @return {string} The padded string
	 */
	private static rightPad(s: string, length: number) {
		return s + SPACES.substr(0, length - s.length);
	}

	/**
	 * Set the info header for the command. This information is displayed before the syntax example when using
	 * toString().
	 * @param header
	 * @return {Command}
	 */
	info(header: string): this {
		this.$info = header;
		return this;
	}

	/**
	 * Sets the callback function that is to be executed upon calling {@see Command.execute()}. This is not required, but when set, you
	 * don't need to provide the callback to the execute method.
	 *
	 * @param callbackFunction The callback that is to be executed, will be executed on a {@see CommandInstance} instance,
	 * which will be available via the this object. The argumens map will be provided as the first argument.
	 */
	onExecute(callbackFunction: (args: Map<string, unknown>) => Promise<R>): this {
		this.$execute = callbackFunction;
		return this;
	}
}

class CommandInstance<R> {

	constructor(
		public readonly command: Command<R>,
		public readonly args: Map<string, unknown>,
		public readonly rawArgs: string[]
	) {
	}

	/**
	 * @return {string} The name of the command.
	 */
	get name() {
		return this.command.name;
	}

	get<T>(argName: string, defaultValue?: T | null): T | null | undefined {
		if (this.args.has(argName)) {
			return this.args.get(argName) as T;
		}
		if (defaultValue !== undefined) {
			return defaultValue;
		}
		return undefined;
	}

	/**
	 * Returns a promise for the execution of the command.
	 *
	 * @param callbackFunction The callback that is to be executed, optional if already set via {@see Command.onExecute}.
	 * The arguments map will be provided as the first argument.
	 * @return {Promise<R>} Promise for anything.
	 */
	async execute(callbackFunction?: (args: Map<string, unknown>) => Promise<R>) {
		const callback = callbackFunction || this.command.$execute;

		// Load the server unless not needed
		if (!callback) {
			throw new Error("No execution callback!");
		}
		if (this.args.get("help")) {
			this.command.options?.logger?.info(() => [this.command.toString()]);
			return;
		}
		try {
			const result = callback.call(this, this.args);
			if (result && result.then && typeof result.then === "function") {
				return await result;
			} else {
				return result;
			}
		} catch (error) {
			this.command?.options?.logger?.error(error.message || error);
			throw error;
		}
	}
}

module.exports.Command = Command;
