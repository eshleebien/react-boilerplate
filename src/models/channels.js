'use strict'

var Request = require('superagent');

module.exports = function (data, next) {

    function start () {

        /*
         * Model request example
         */
        Request
            .get('/')
            .end(next);
    }

    start();
};
