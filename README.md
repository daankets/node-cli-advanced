# Advanced NodeJS Command Line Interpreter

## Motivation

This is a backport from some of my own projects, that I decided to make available as a utility. This typescript based library (ES2015) allows for setting
command line interfaces in a declarative way.

## Features

- Declare a new CLI Command by creating a Command instance
- Declare arguments by adding them to the command instance
- Add parsers for built-in and custom argument types
- Declare single vs array arguments
- Performs validation if required
- Conditionally required arguments (based on value or absence of other arguments for example)
- Pattern matching for string arguments
- Named arguments (`--say Hello`)
- Argument shortcodes (`-s Hello`)
- Positional arguments (`cp <source> <target>`)
- Boolean flag arguments (-R) without value (`cp -R <source> <target>`)
- Set a callback for execution of the command, or provide a diffent callback every time
- Parse a string
- Parse a string array
- Parse process argv
- Execute after parsing
- Provide help text and usage
- Use a custom logger
- Strict mode (disallow undeclared arguments)

## Usage

### Installation

```bash
# Install via NPM
npm install --save node-commandline-advanced

# Optionally install moment if you are using the moment parser
npm install --save moment
```

> **Note**
>
> The library contains TypeScript declarations and source maps

### Declaring a command

```typescript
// A demo command with strict parsing disabled and a description.
const demoCommand = new Command("demo", {strict: false})
    .info("A demo command");
```

### Declaring arguments

```typescript
const demoCommand = new Command("demo", true)
    .info("A demo command")
    // A flag argument
    .addArgument({
        name: "fast",
        shortCode: "f",
        description: "Execute fast!",
        // required: false // ALWAYS FALSE FOR FLAGS,
        parser: BooleanParser,
        // array: false // ALWAYS FALSE FOR FLAGS
    })
    .addArgument({
        name: "in",
        shortCode: "i",
        description: "Input file",
        // required: true // REQUIRED BY DEFAULT
        // parser: null // Default parser parses strings,
        array: true // Allow for multiple input files!
    })
    .addArgument({
        name: "optional",
        required: false
    })
```

## Parsing a command line

```typescript
// Assume the previously declared demoCommand...
// parsing will throw if the input is invalid!
const instance = demoCommand.parse("--fast", "-i", "/some/path,/some/other/path");
const fast: Boolean = instance.get("fast");
const inputFiles: String[] = instance.get("in");
const optional: string = instance.get("optional", "Some optional default");
```

## Parsing Node process args

```typescript
export {myCommand} from "./my-command.ts";
// Set async handler
myCommand.onExecute(async function (args) {
    // this is the command instance

    // Do something async ;-)
    return Promise.resolve(args);
});

// If this module is the main module, parse process args and execute!
if (require.main === module) {
    const instance = myCommand.parseProcessArgs();
    export default instance.execute();
}
```

## Override --help

By default, the command instance will add the "help" argument with shortcode "?" if not declared by your command upon parsing. If the command typed is invalid,
the output will be sent to the console.

## Override logging

You can prevent or redirect logging by providing an alternative logger. Setting the logger to null will prevent logging.
The logger expexts the IConsole interface

```typescript
const command = new Command("demo", {logger: console});
```

## Parsers

A parser allows conversion of a string argument into a typed value. The following parsers are supported out of the box:

|parser|type|remark|
|---|---|---|
| null | String | Default |
| BooleanParser | Boolean | Case insensitive, supports 0/1, yes/no, true/false |
| DateParser | Date | Checks for invalid dates, supports 'now' literal |
| MomentParser | Moment | Requires MomentJS optional dependency, supports 'now','today','tomorrow','yesterdat' literals. |
| NumberParser | Number |
| IntParser | Number | Restricted to integers |
| ObjectParser | Object | Parses JSON into an object
| PathParser | ParsedPath | Does not check for target existence |
| RegExpParser | RegExp | Parses patterns AND flags if provided |

## License and Copyright

* Copyright ©2021 Daan Kets
* This software is distributed under the included MIT license.<br>
  _See included [LICENSE](./LICENSE) file_

## Depencencies

### [moment.js](https://momentjs.com/) - MIT license

This project can optionally use (but does not depend upon or distribute) the momentjs library.