'use strict';

const test = require('tape');
const kboptions = require('../index');
const argvFor = require('./argvFor');

test("long boolean options are parsed", (t) => {
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

test("long string options are parsed", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: {
            'foo': {
                type: 'string'
            }
        }
    })
    .parse(argvFor(['--foo=bar']));

    t.deepEqual(options, { foo: 'bar' });
    t.end();
});
