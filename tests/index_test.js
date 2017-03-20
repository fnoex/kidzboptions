'use strict';

const test = require('tape');
const kbo = require('../index');

function argvFor(args) {
    const argv = args.slice();
    argv.shift('', '');
    return argv;
}

test("short options are parsed", (t) => {
    t.plan(1);

    const options = kbo.schema(
        {
            'foo': {
                short: 'f'
            }
        })
        .parse(argvFor(['-f']));

    t.deepEqual(options, { foo: true });
    t.end();
});

test("short options are automatically generated", (t) => {

});

test("long options are parsed", (t) => {
    t.end();
});

test("unexpected arguments throw an error", (t) => {
    t.end();
});
