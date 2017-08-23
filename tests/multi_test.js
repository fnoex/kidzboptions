'use strict';

const test = require('tape');
const kboptions = require('../index');
const argvFor = require('./argvFor');

test("multi string values are aggregated", (t) => {
    t.plan(1);

    const result = kboptions.parser({
        options: {
            foo: {
                type: 'string',
                multi: true
            }
        }
    })
    .parse(argvFor(['-f', 'dog', '-f', 'cat']));

    t.deepEqual(result.options, { foo: ['dog', 'cat'] });
    t.end();
});

test("multi string values always present", (t) => {
    t.plan(1);

    const result = kboptions.parser({
        options: {
            foo: {
                type: 'string',
                multi: true
            }
        }
    })
    .parse(argvFor([]));

    t.deepEqual(result.options, { foo: [] });
    t.end();
});

test("multi only allowed for strings", (t) => {
    t.plan(1);

    t.throws(() => {
        kboptions.parser({
            options: {
                foo: {
                    multi: true
                }
            }
        });
    });
    t.end();
});
