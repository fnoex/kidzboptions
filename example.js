'use strict';

const kboptions = require('./index');

const parser = kboptions.parser({
    options: {
        foo: {
            description: 'Enables foo mode',
            short: 'F'
        },
        bar: {
            required: false
        }
    },
    positional: ['blah', 'files']
});

const options = function() {
    try {
        parser.parse(process.argv);
    } catch (e) {
        if (e instanceof kboptions.UsageError) {
            // prints: "Argument xxx is required" or something
            console.error(e.message);

            // prints: "Usage: scriptname [options] <blah> [files...]"
            parser.educate();

            process.exit(1);
        } else {
            throw e;
        }
    }
}();

console.log("Parsed options:", options);
