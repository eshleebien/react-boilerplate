'use strict';

var React = require('react/addons'),
    RouterModule = require('react-router'),
    Route = RouterModule.Route,
    Components = require('../components');

module.exports = {
    config: (
        /* Define your routes here */

        <Route path="/" handler = {Components.main}> /* Route group */
            <Route name="app" path="about" component={ 'test' }/>
            <Route name="apptest" path="/test" component={ require('../components/main') }/>
        </Route>

        /* End of route configuration */
    ),
    mod: RouterModule
};
