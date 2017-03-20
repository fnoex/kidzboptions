'use strict';

const test = require('tape');
const kboptions = require('../index');
const argvFor = require('./argvFor');

test("positional arguments are parsed", (t) => {
    t.plan(1);

    const options = kboptions.parser({
        options: { },
        positional: ['a', 'b']
    })
    .parse(argvFor(['foo', 'bar']));

    t.deepEqual(options, { a: 'foo', b: 'bar' });
    t.end();
});
