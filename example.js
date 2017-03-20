'use strict';

const kboptions = require('./index');

const parser = kboptions.parser({
    options: {
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

const options = function() {
    try {
        return parser.parse(process.argv);
    } catch (e) {
        if (e instanceof kboptions.UsageError) {
            console.error(e.message);

            // Prints usage info generated from option schema
            parser.educate();

            process.exit(1);
        } else {
            throw e;
        }
    }
}();

if (options.help) {
    parser.educate();
    process.exit(0);
}

console.log("Parsed options:", options);
