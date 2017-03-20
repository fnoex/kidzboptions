'use strict';

const test = require('tape');
const kboptions = require('../index');

test("usage includes all options", (t) => {
    t.plan(2);

    const usage = kboptions.parser({
        options: {
            foo: { },
            bar: { }
        }
    })
    .usage();

    t.ok(usage.match(/--foo/));
    t.ok(usage.match(/--bar/));
    t.end();
});

test("usage includes description near option", (t) => {
    t.plan(1);

    const parser = kboptions.parser({
        options: {
            foo: {
                description: "foodescription"
            }
        }
    });

    t.ok(parser.usage().match(/--foo\s+foodescription/));
    t.end();
});

test("usage starts with script name", (t) => {
    t.plan(1);

    const usage = kboptions.parser({}).usage("/foo/bar/testscript1");

    t.ok(usage.match(/Usage: testscript1 \[options\]/));
    t.end();
});

test("usage includes positional args", (t) => {
    t.plan(1);

    const usage = kboptions.parser({
        positional: ['foo', 'bar']
    })
    .usage();

    t.ok(usage.match(/\[options\] <foo> <bar>/));
    t.end();
});
