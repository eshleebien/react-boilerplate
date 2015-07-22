'use strict'

var Request = require('superagent'),
    Config = require('../config/config');

module.exports = function (data, next) {

    function start () {
        if (!data.duration) {
            data.duration = 2;
        }

        Request
            .get(Config.API.host + ':' + Config.API.port + '/channels/growth')
            .query({ month: data.month, duration: data.duration, network: data.category })
            .end(next);
    }

    start();
};
