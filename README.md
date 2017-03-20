# kidzboptions

Lightweight command-line option parsing.

## Usage

```javascript
const kboptions = require('kidzboptions');

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

            // Prints:
            // Usage: example.js [options] <input-file> <output-file>
            //   -f --first-name
            //      User's first name
            //   -l --last-name
            //      User's last name
            //   -d --dog-lover
            //      User loves dogs
            //   -c --cat-lover
            //      User loves cats
            console.error(parser.usage());

            process.exit(1);
        } else {
            throw e;
        }
    }
}();
```

Kidzboptions has a very small API. It exposes one method: `parser`, which takes an object describing the options you want to parse, and returns a parser.

The parser also has one method, `parse`, which takes an ARGV string array and returns an object containing parsed options.

## API

### kboptions.parser({ options, positional })

TODO

### parser.parse(argv)

TODO
