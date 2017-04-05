'use strict';

const kboptions = require('./index');

const options = kboptions.parse({
    info: "Demonstrates how to use kidzboptions",
    version: "1.0.0",
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

console.log("Parsed options:", options);
