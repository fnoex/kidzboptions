'use strict';

const UsageError = require('./usageError');
const path = require('path');

function createParser(schemaDefinitions = {}) {
    const schema = createSchema(schemaDefinitions);

    function parse(argv, usageStream = process.stderr) {
        const components = parseComponents(argv);
        console.log("parsed components:", components);

        try {
            return processComponents(components, schema);
        } catch (e) {
            if (e instanceof UsageError) {
                usageStream.write(e.message + '\n\n');
                const scriptName = path.basename(argv[1]);
                const usage = usageFromSchema(schema, scriptName);
                usageStream.write(usage + '\n\n');
                process.exit(1);
            } else {
                throw e;
            }
        }
    }

    // TODO: public API docs
    return { parse };
}

function createSchema(definitions) {
    const supportedTypes = [ 'string', 'boolean' ];

    const schema = [];
    Object.keys(definitions).forEach(key => {
        const definition = definitions[key];
        const type = definition.type || 'boolean';
        const scheme = {
            name: key,
            type,
            description: definition.description,
            long: key,
            short: definition.short
        };

        if (!supportedTypes.includes(type)) {
            throw new Error(`Argument type for ${key} must be one of: ${supportedTypes.join(', ')}`);
        }

        if (definition.short && schema.some(s => s.short === definition.short)) {
            throw new Error(`Short option ${definition.short} specified twice`);
        }

        schema.push(scheme);
    });

    // TODO: auto-add help arg

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
            // TODO: mark this and validate so that --my-bool=value fails
            results.push({
                type: 'value',
                value: match[3],
                raw: match[3]
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
        return schema.find(scheme => {
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
        },

        value: function(component, scheme) {
            // TODO
        }
    };

    while (components.length > 0) {
        const component = components.shift();
        const scheme = findScheme(component);
        if (!scheme) {
            console.error("component:", component);
            throw new UsageError("Unrecognized argument: " + component.raw);
        }

        console.log("scheme type:", scheme.type);
        const consume = consumers[scheme.type];
        consume(component, scheme);
    }

    // TODO: validate required options

    return result;
}

function usageFromSchema(schema, scriptName) {
    const lines = [];
    lines.push(`Usage: ${scriptName} [options]`);
    lines.push(...schema.map(scheme => {
        const buf = ['  '];
        if (scheme.short) {
            buf.push('-', scheme.short);
        } else {
            buf.push('  ');
        }
        buf.push(' --');
        buf.push(scheme.long);
        if (scheme.description) {
            buf.push('\n     ');
            buf.push(scheme.description);
        }
        return buf.join('');
    }));
    return lines.join('\n');
}

// TODO:, set banner/usage

module.exports = {
    // TODO: docs
    schema: createParser,
    UsageError
};
