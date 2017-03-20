'use strict';

const test = require('tape');
const kboptions = require('../index');
const argvFor = require('./argvFor');

test("string values are parsed", (t) => {
    t.plan(1);

    const options = kboptions.parser({
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

    t.deepEqual(options, { foo: 'dog', bar: 'cat' });
    t.end();
});

test("required strings must be present", (t) => {
    t.plan(1);

    const parser = kboptions.parser({
        options: {
            foo: {
                type: 'string',
                required: true
            }
        }
    });

    t.throws(() => {
        parser.parse(argvFor([]));
    });
    t.end();
});

test("optional strings can be missing", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: {
            foo: {
                type: 'string'
            }
        }
    })
    .parse(argvFor([]));

    t.deepEqual(options, {});
    t.end();
});
