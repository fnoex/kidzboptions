'use strict';

function parse(argv) {
    if (!(argv && argv.length)) {
        return [];
    }
    const args = argv.slice(2);
    const components = args.reduce((components, arg) => {
        components.push(...componentsFromArg(arg));
        return components;
    }, []);
    return components;
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
                // throw new usage error
                throw new Error(`Argument ${component.raw} requires a string value`);
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
            throw new Error("Unrecognized argument: " + component.raw);
            // throw unrecognized argument exception: component.raw
        }

        const consume = consumers[scheme.type];
        consume(component, scheme);
    }

    return result;
}

console.log("process.argv:", process.argv);
const components = parse(process.argv);
const schema = [
    {
        name: 'firstName',
        long: 'first-name',
        short: 'f',
        type: 'string'
    },
    {
        name: 'lastName',
        long: 'last-name',
        short: 'l',
        type: 'string'
    },
    {
        name: 'florped',
        long: 'florped',
        short: 'P',
        type: 'boolean'
    }
];
console.log("parsed components:", components);
const result = processComponents(components, schema);

console.log("result:", result);
