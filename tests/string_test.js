'use strict';

const test = require('tape');
const kboptions = require('../index');
const argvFor = require('./argvFor');

test("string values are parsed", (t) => {
    t.plan(1);

    const result = kboptions.parser({
        options: {
            foo: {
                type: 'string'
            },
            bar: {
                type: 'string'
            }
        }
    })
    .parse(argvFor(['-f', 'dog', '--bar=cat']));

    t.deepEqual(result.options, { foo: 'dog', bar: 'cat' });
    t.end();
});

test("required strings must be present", (t) => {
    t.plan(1);

    const result = kboptions.parser({
        options: {
            foo: {
                type: 'string',
                required: true
            }
        }
    })
    .parse(argvFor([]));

    t.ok(result.errors);
    t.end();
});

test("optional strings can be missing", (t) => {
    t.plan(1);

    const result = kboptions.parser({
        options: {
            foo: {
                type: 'string'
            }
        }
    })
    .parse(argvFor([]));

    t.deepEqual(result.options, {});
    t.end();
});

test("last value wins", (t) => {
    t.plan(1);

    const result = kboptions.parser({
        options: {
            foo: {
                type: 'string'
            }
        }
    })
    .parse(argvFor(['-f', 'a', '-f', 'b']));

    t.deepEqual(result.options, { foo: 'b' });
    t.end();
});
