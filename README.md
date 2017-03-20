# kidzboptions

Lightweight command-line option parsing.

## Usage

```
const kbo = require('kidzboptions');

const options = kbo.schema(
  {
    foo: {
      type: 'boolean',
      short: 'f',
      description: 'Enables foo mode.'
    },
    'baz-quux': {
      type: 'string',
      short: 'b',
      description: 'Specifies the baz-quux.'
    }
  })
  .parse(process.argv);
```

Kidzboptions has a very small API. It exposes one method: `schema`, which takes an object describing the options you want to parse.

`schema` returns another object with one method: `parse`, which takes an ARGV string array and returns an object containing parsed options.

## API

### schema()

TODO

### parse()

TODO
