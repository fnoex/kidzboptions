'use strict';

const test = require('tape');
const options = require('../options');

test('short option parsing', (t) => {
    t.plan(1);

    const result = options.parse("-a");
    t.deepEqual(result, { apple: true });
});

test('long option parsing', (t) => {

});

test('unexpected arguments throw an error', (t) => {

});
