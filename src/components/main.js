/** @jsx React.DOM */
'use strict'

var React = require('react/addons'),
    Graph = require('../components/channel_graph');

module.exports = React.createClass({

    getInitialState: function () {
        return {value: '', title: 'Channel Growth Feature'};
    },

    render: function () {
        return (
            <div>
                <nav>
                    <div className='nav-wrapper'>
                    </div>
                </nav>
                <div className='container'>
                    <Graph/>
                </div>
            </div>
        );
    }
});
