'use strict';

const test = require('tape');
const kbo = require('../index');

function argvFor(args) {
    const argv = args.slice();
    argv.unshift('', '');
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

test.skip("short options are automatically generated", (t) => {
    t.plan(1);

    const options = kbo.schema(
        {
            'foo': { }
        })
        .parse(argvFor(['-f']));

    t.deepEqual(options, { foo: true });
    t.end();
});

test("short options cannot occur twice", (t) => {
    t.plan(1);

    t.throws(() => {
        kbo.schema({
            'foo': { short: 'f' },
            'bar': { short: 'f' }
        });
    });
    t.end();
});

test("long options are parsed", (t) => {
    t.plan(1);

    const options = kbo.schema(
        {
            'foo': { }
        })
        .parse(argvFor(['--foo']));

    t.deepEqual(options, { foo: true });
    t.end();
});
