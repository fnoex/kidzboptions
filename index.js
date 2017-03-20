'use strict';

const UsageError = require('./usageError');
const path = require('path');
const os = require('os');

function createParser(schemaDefinitions = {}) {
    const schema = createSchema(schemaDefinitions);

    function parse(argv) {
        const components = parseComponents(argv);
        console.log("parsed components:", components);
        return processComponents(components, schema);
    }

    function usage(argv1 = process.argv[1]) {
        const scriptName = path.basename(argv1);
        return usageFromSchema(schema, scriptName);
    }

    return {
        /**
         * Parses an ARGV array and returns an object containing values keyed
         * according to this parser's schema.
         *
         * @param {Array<string>} argv
         *      The ARGV array, generally from `process.argv`.
         * @returns {Object} an object with option values
         * @throws UsageError if parsing fails
        **/
        parse,
        /**
         * Gets a human-friendly string containing the usage info, generated
         * from the option schema. You can display this with `console.error`
         * or similar method.
         * @param {String} argv1
         *      The name of this program to display in the usage. The default
         *      value is `process.argv[1]`, which is generally ideal.
         * @returns {String}
        **/
        usage
    };
}

function createSchema({ options = {}, positional = [] }) {
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

    console.log("args:", args);
    const matchers = [
        parseLongOption,
        parseShortOptionSet,
        parseShortOption,
        // TODO
        // parseOptionTerminator
        parseValue
    ];

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

function processComponents(components, schema) {

    function findScheme(component) {
        return schema.options.find(scheme => {
            const name = scheme[component.type];
            return name && name === component.value;
        });
    }

    let result = {};

    const consumers = {
        string: function(component, scheme) {
            const next = components.shift();
            if (!(next && next.type === 'value')) {
                throw new UsageError(`Argument ${component.raw} requires a string value`);
            }
            result[scheme.name] = next.value;
        },

        boolean: function(component, scheme) {
            result[scheme.name] = !result[scheme.name];

            const next = components[0];
            if (next && next.attached) {
                throw new UsageError(`Argument ${component.raw} is boolean and does not take a value`);
            }
        }
    };

    const positional = schema.positional.slice();

    while (components.length > 0) {
        const component = components.shift();
        if (component.type === 'value') {
            const scheme = positional.shift();
            if (!scheme) {
                throw new UsageError("Unexpected extra argument");
            }

            result[scheme.name] = component.value;
        } else {
            const scheme = findScheme(component);
            if (!scheme) {
                console.error("component:", component);
                throw new UsageError("Unrecognized argument: " + component.raw);
            }

            console.log("scheme type:", scheme.type);
            const consume = consumers[scheme.type];
            consume(component, scheme);
        }
    }

    // Ensure booleans are present
    schema.options.filter(s => s.type === 'boolean').forEach(scheme => {
        result[scheme.name] = Boolean(result[scheme.name]);
    });

    schema.options.filter(s => s.required).forEach(scheme => {
        if (!result[scheme.name]) {
            throw new UsageError(`Missing required option --${scheme.long}`);
        }
    });

    return result;
}

function usageFromSchema(schema, scriptName) {
    let buf = '';
    const eol = os.EOL;

    buf += `Usage: ${scriptName} [options]`;
    schema.positional.forEach(scheme => {
        buf += ` <${scheme.name}>`;
    });
    buf += eol;

    schema.options.forEach(scheme => {
        buf += '  ';
        if (scheme.short) {
            buf += `-${scheme.short}`;
        } else {
            buf += '  ';
        }
        buf += ` --${scheme.long}`;
        if (scheme.description) {
            buf += eol;
            buf += '     ';
            buf += scheme.description;
        }
        buf += eol;
    });
    return buf;
}

module.exports = {
    /**
     * Creates a parser with the specified option schema.
     *
     * @param {Object} config
     * @param {Object} config.options
     *      The options. Each key is the name of an option that will be
     *      returned in the parse result. The option names double as the
     *      long-name form of each option. Each option can have the following
     *      properties, all of which are optional:
     *
     *      type: "string" and "boolean" (default: "boolean")
     *      short: the short option character (default: first character of
     *             long name, if there is no conflict)
     *      required: A boolean indicating the field is required. Only
     *                meaningful for strings. (default: false)
     *      description: The description, which will be printed in the usage
     *                   text.
     * @param {Array<string>} config.positional
     *      The names of required positional arguments.
    **/
    parser: createParser,
    /**
     * Thrown by the parser if the specified ARGV array does not match the
     * parser's schema. Generally you will want to catch this and react by
     * printing the parser's `usage`.
    **/
    UsageError
};
