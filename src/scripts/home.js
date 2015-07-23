/** @jsx React.DOM */
'use strict';

var React = require('react'),
    Router = require('../config/router');

Router.mod.run(Router.config, function (Handler) {
    React.render(
        <Handler/>, document.body
    );
});

