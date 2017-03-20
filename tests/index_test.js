'use strict';

const test = require('tape');
const kboptions = require('../index');

function argvFor(args) {
    const argv = args.slice();
    argv.unshift('', '');
    return argv;
}

test("short options are parsed", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: {
            foo: {
                short: 'f'
            }
        }
    })
    .parse(argvFor(['-f']));

    t.deepEqual(options, { foo: true });
    t.end();
});

test("short options are automatically generated", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: {
            'foo': { }
        }
    })
    .parse(argvFor(['-f']));

    t.deepEqual(options, { foo: true });
    t.end();
});

test("short options cannot occur twice", (t) => {
    t.plan(1);

    t.throws(() => {
        kboptions.parser({
            options: {
                foo: { short: 'f' },
                bar: { short: 'f' }
            }
        });
    });
    t.end();
});

test("long options are parsed", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: {
            'foo': { }
        }
    })
    .parse(argvFor(['--foo']));

    t.deepEqual(options, { foo: true });
    t.end();
});
