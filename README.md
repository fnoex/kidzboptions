# kidzboptions

Lightweight and easy command-line option parsing.

## Usage

```javascript
const kboptions = require('kidzboptions');

const options = kboptions.parse({
    info: "Demonstrates how to use kidzboptions",
    version: "1.0.0",
    options: {
        // Object keys are long options. This becomes the long option --first-name
        "first-name": {
            // currently supported types are "string" or "boolean"
            type: "string",

            // if not specified, short option is automatically generated
            // from first character of long option
            short: "f",

            // description is optional
            description: "User's first name"
        },
        "last-name": {
            type: "string",
            description: "User's last name",

            // Unless specified, all options are optional
            required: true
        },
        "dog-lover": {
            // If not specified, type defaults to "boolean"

            description: "User loves dogs"
        },
        "cat-lover": {
            description: "User loves cats"
        }
    },
    // Positional arguments can be named
    positional: ["input-file", "output-file"]
});
```

## API

### kidzboptions.options({ info, version, options, positional })

This is the easiest way to parse options. You pass in a configuration describing the options you want, and get back an object with option values keyed by option name.

Options for `--help` and `--version` are automatically added. If specified, kidzboptions will print usage or version information and exit the process with a zero error code.

If the passed options are invalid (say, a string option was not given a value), kidzboptions will print an error & usage information, and exit the process with a non-zero error code.

All configuration properties are optional:

- `info`: a string describing this program, which is printed with the usage text
- `version`: the program version, printed if the `--version` option is given
- `options`: an object describing your command line options. See below.
- `positional`: an array of strings that will be used to name anonymous (positional) arguments to your program

#### Option specification

In the option schema, object keys automatically become the long form of your options. Every option must have a long form. The following properties are supported (all optional).

- `description`: A string to be printed in the usage text to describe this option. Defaults to no description.
- `type`: Can be `"string"` to indicate that an option requires a value or `"boolean"` to indicate that it does not.
  
  String option values may be passed with the short form `-a value` or the long form `--a-long-option=value`. Defaults to `"boolean"`.
  
  Boolean options can be specified multiple times, which will cause the value to be flipped each time it occurs.

- `short`: A single-character string specifying the short option. Defaults to the first character of the long option, unless it conflicts with another option, in which case the option will have no short version.
- `required`: A boolean indicating that an option value must be provided. Only applies to string options. Defaults to `false`.

### kidzboptions.parser()

If you need more control over the result of your parsing, this method takes the same arguments as `options` but returns a parser that you can call manually with the following functions.

### parser.parse(arg)

Parses an `ARGV` array and returns the result. The result object has these properties:

- `help`: true if the `--help` option was specified
- `version`: true if the `--version` option was specified
- `errors`: an array of strings containing any validation errors
- `result`: The parsed options. This is the same object you get back from `options()` if parsing succeeds.

### parser.usage()

Gets the usage text, generated from the option schema.

### parser.version()

Gets the version text, generated from the option schema.
