'use strict';

module.exports = function(args) {
    const argv = args.slice();
    argv.unshift('', '');
    return argv;
};
