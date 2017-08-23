'use strict';

const path = require('path');
const os = require('os');
const cliFormat = require('cli-format');


/**
 * Easy mode. Parses `ARGV` using the specified option schema. If any
 * arguments are missing or invalid, or if the `--help` option is
 * specified, usage will be printed and the process will exit.
 *
 * @alias parse
 * @param {object} config
 *      The parser configuration. See {@link parser}.
 *
 * @returns {object} the parsed options, keyed by option name
**/
function easyOptions(config) {
    const parser = createParser(config);
    const result = parser.parse(process.argv);
    if (result.help) {
        console.log(parser.usage());
        process.exit(0);
    } else if (result.version) {
        console.log(parser.version());
        process.exit(0);
    } else if (result.errors.length > 0) {
        console.error(result.errors[0]);
        console.error(parser.usage());
        process.exit(1);
    }
    return result.options;
}

/**
 * Creates a parser with the specified option schema.
 *
 * @alias parser
 * @param {object} config
 * @param {string} [config.info]
 *      A description of the program to be printed with the usage text.
 * @param {string} [config.version]
 *      The program version, for the `--version` option.
 * @param {object} [config.options]
 *      The options. Each key is the name of an option that will be
 *      returned in the parse result. The option names double as the
 *      long-name form of each option. Each option can have the following
 *      properties, all of which are optional:
 *
 *    - `type`: "string" or "boolean" (default: "boolean")
 *    - `short`: the short option character (default: first character of
 *      long name, if there is no conflict)
 *    - `required`: A boolean indicating the field is required. Only
 *      meaningful for strings. (default: false)
 *    - `description`: The description, which will be printed in the usage
 *      text.
 * @param {array<string>} [config.positional]
 *      The names of required positional arguments.
 * @returns {Parser} the parser
**/
function createParser({ info, version, options = {}, positional = [] }) {
    const schema = createSchema({ options, positional, version });

    /**
     * @memberof Parser
     * @instance
     *
     * Parses an `ARGV` array and returns an object representing the result
     * of parsing.
     *
     * @param {array<string>} argv
     *      The `ARGV` array, generally from `process.argv`.
     * @returns {ParsingResult} the parsing result
    **/
    function parse(argv) {
        const components = parseComponents(argv);
        return processComponents(components, schema);
    }

    /**
     * @memberof Parser
     * @instance
     *
     * Gets a human-friendly string containing the usage info, generated
     * from the option schema. You can display this with `console.error`
     * or similar method.
     * @param {string} [argv1]
     *      The name of this program to display in the usage. The default
     *      value is `process.argv[1]`, which is generally ideal.
     * @returns {string} the usage text
    **/
    function usage(argv1 = process.argv[1]) {
        const scriptName = path.basename(argv1);
        return generateUsage(info, schema, scriptName);
    }

    /**
     * @memberof Parser
     * @instance
     * @alias version
     *
     * Gets the version info string.
     * @param {string} [argv1]
     *      The script name. Defaults to the value of `process.argv[1]`.
     * @returns {string} the version text
    **/
    function formatVersion(argv1 = process.argv[1]) {
        const scriptName = path.basename(argv1);
        if (version) {
            return `${scriptName} ${version}`;
        } else {
            return scriptName;
        }
    }

    /**
     * @namespace Parser
    **/
    return {
        parse,
        usage,
        version: formatVersion
    };
}

function createSchema({ options, positional, version }) {
    const supportedTypes = [ 'string', 'boolean' ];
    const schema = { options: [], positional: [] };

    Object.keys(options).forEach(key => {
        const option = options[key];
        const type = option.type || 'boolean';
        const scheme = {
            name: key,
            type,
            description: option.description,
            long: key,
            short: option.short,
            required: Boolean(option.required)
        };

        if (!supportedTypes.includes(type)) {
            throw new Error(`Argument type for ${key} must be one of: ${supportedTypes.join(', ')}`);
        }

        if (option.short) {
            if (option.short.length > 1) {
                throw new Error(`Illegal short option -${option.short} must be 1 character.`);
            }
            if (schema.options.some(s => s.short === option.short)) {
                throw new Error(`Short option -${option.short} specified twice`);
            }
        }

        schema.options.push(scheme);
    });

    if (!schema.options.some(s => s.long === 'help')) {
        // Auto-generate a help option
        const help = {
            name: 'help',
            type: 'help',
            description: 'Show this message',
            long: 'help',
            required: false
        };
        if (!schema.options.some(s => s.short === 'h')) {
            help.short = 'h';
        }
        schema.options.push(help);
    }

    if (version && !schema.options.some(s => s.long === 'version')) {
        // Auto-generate a version option
        const version = {
            name: 'version',
            type: 'version',
            description: 'Print version and exit',
            long: 'version',
            required: false
        };
        if (!schema.options.some(s => s.short === 'v')) {
            version.short = 'v';
        }
        schema.options.push(version);
    }

    if (positional && positional.length) {
        positional.forEach(key => {
            if (schema.options.some(s => s.name === key)) {
                throw new Error(`Option name ${key} specified twice`);
            }
            schema.positional.push({
                name: key
            });
        });
    }

    // Automatically create short options where possible.
    schema.options.filter(s => !s.short).forEach(scheme => {
        const autoshort = scheme.long.charAt(0);
        if (!schema.options.some(s => s.short === autoshort)) {
            scheme.short = autoshort;
        }
    });

    return schema;
}

function parseComponents(argv) {
    if (!(argv && argv.length)) {
        return [];
    }
    const args = argv.slice(2);

    const matchers = [
        parseLongOption,
        parseShortOptionSet,
        parseShortOption,
        // TODO
        // parseOptionTerminator
        parseValue
    ];

    function parseLongOption(arg) {
        let results = [];
        const match = /^--([^=]+)(=(.*))?/.exec(arg);
        if (match) {
            results.push({
                type: 'long',
                value: match[1],
                raw: arg
            });
            if (match[3]) {
                results.push({
                    type: 'value',
                    value: match[3],
                    raw: match[3],
                    attached: true
                });
            }
        }
        return results;
    }

    function parseShortOptionSet(arg) {
        const match = /^-([^\-\s]{2,})/.exec(arg);
        if (match) {
            return match[1].split('').map(char => {
                return {
                    type: 'short',
                    value: char,
                    raw: `-${char}`
                };
            });
        }
        return [];
    }

    function parseShortOption(arg) {
        const match = /^-([^\-\s])/.exec(arg);
        if (match) {
            return [{
                type: 'short',
                value: match[1],
                raw: arg
            }];
        }
        return [];
    }

    function parseValue(arg) {
        return [{
            type: 'value',
            value: arg,
            raw: arg
        }];
    }

    function componentsFromArg(arg) {
        for (let i = 0, len = matchers.length; i < len; i++) {
            const matcher = matchers[i];
            const components = matcher(arg);
            if (components.length > 0) {
                return components;
            }
        }
    }

    const components = args.reduce((components, arg) => {
        components.push(...componentsFromArg(arg));
        return components;
    }, []);

    return components;
}

function processComponents(components, schema) {

    function findScheme(component) {
        return schema.options.find(scheme => {
            const name = scheme[component.type];
            return name && name === component.value;
        });
    }

    /**
     * @typedef ParsingResult
     *
     * @property {object} options
     *      the parsed options
     * @property {boolean} help
     *      true if the `--help` option was invoked
     * @property {boolean} version
     *      true if the `--version` option was invoked
     * @property {array<string>}
     *      contains parsing errors
    **/
    const result = {
        options: {},
        help: false,
        version: false,
        errors: []
    };

    const consumers = {
        string: function(component, scheme) {
            const next = components.shift();
            if (!(next && next.type === 'value')) {
                result.errors.push(`Argument ${component.raw} requires a string value`);
            } else {
                result.options[scheme.name] = next.value;
            }
        },

        boolean: function(component, scheme) {
            result.options[scheme.name] = !result.options[scheme.name];

            const next = components[0];
            if (next && next.attached) {
                result.errors.push(`Argument ${component.raw} is boolean and does not take a value`);
            }
        },

        help: function(component, scheme) {
            result.help = true;
        },

        version: function(component, scheme) {
            result.version = true;
        }
    };

    const positional = schema.positional.slice();

    while (components.length > 0) {
        const component = components.shift();
        if (component.type === 'value') {
            const scheme = positional.shift();
            if (!scheme) {
                result.errors.push("Unexpected extra argument");
            } else {
                result.options[scheme.name] = component.value;
            }
        } else {
            const scheme = findScheme(component);
            if (!scheme) {
                result.errors.push("Unrecognized argument: " + component.raw);
            } else {
                const consume = consumers[scheme.type];
                consume(component, scheme);
            }
        }
    }

    // Ensure booleans are present
    schema.options.filter(s => s.type === 'boolean').forEach(scheme => {
        result.options[scheme.name] = Boolean(result.options[scheme.name]);
    });

    schema.options.filter(s => s.required).forEach(scheme => {
        if (!result.options[scheme.name]) {
            result.errors.push(`Missing required option --${scheme.long}`);
        }
    });

    return result;
}

function generateUsage(info, schema, scriptName) {
    let buf = '';
    const eol = os.EOL;

    if (info) {
        buf += info;
        buf += eol;
    }

    buf += `Usage: ${scriptName} [options]`;
    buf += schema.positional.map(scheme => ` <${scheme.name}>`).join('');
    buf += eol;

    const leftColumnWidth = function() {
        const prefix = '  -X, --'.length;
        const longestOption = schema.options.reduce((max, scheme) => Math.max(max, scheme.long.length), 0);
        return prefix + longestOption;
    }();

    const leftColumn = schema.options
        .map(scheme => {
            const short = scheme.short ? `-${scheme.short},` : '   ';
            return `  ${short} --${scheme.long}`;
        })
        .join('\n');
    const rightColumn = schema.options
        .map(scheme => scheme.description || '')
        .join('\n');
    const columns = [
        { content: leftColumn, width: leftColumnWidth },
        rightColumn
    ];
    buf += cliFormat.columns.wrap(columns, { paddingMiddle: '    ' });

    return buf;
}

module.exports = {
    parse: easyOptions,
    parser: createParser,
};
