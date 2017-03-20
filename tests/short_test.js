'use strict';

const test = require('tape');
const kboptions = require('../index');
const argvFor = require('./argvFor');

test("short boolean options are parsed", (t) => {
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

test("short string options are parsed", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: {
            foo: {
                short: 'f',
                type: 'string'
            }
        }
    })
    .parse(argvFor(['-f', 'bar']));

    t.deepEqual(options, { foo: 'bar' });
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
