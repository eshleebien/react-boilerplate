'use strict';

var React = require('react/addons'),
    LineChart = require('react-chartjs').Line,
    moment = require('moment'),
    ChannelStats = require('../models/channelstats'),
    DTPicker = require('react-widgets/lib/DateTimePicker');

module.exports = React.createClass({

    getInitialState: function () {
        return {
            loader: false,
            category: 'anytv_affiliate',
            month: moment().subtract(1, 'month').format('YYYY-MM'),
            duration: 2, // default duration
            has_chart: false,
            chart_options: {
                responsive: true,
                pointDotRadius: 10,
                pointDotStrokeWidth: 4,
                scaleLabel: "<%=(parseInt(value) % (parseInt(value)/3)) ? '' : parseInt(value).toLocaleString()%>",
                tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%=value.toLocaleString()%>",
            },
            charts: {
                'views': {
                    labels: [],
                    datasets: [{
                            labels: "Views",
                            data: [],
                            fillColor: "rgba(39,166,154,0.2)",
                            strokeColor: "rgba(3,136,122,1)",
                            pointColor: "rgba(39,166,154,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(39,166,154,1)",
                        }]
                },
                'subscribers': {
                    labels: [],
                    datasets: [{
                            label: "Subscribers",
                            data: [],
                            fillColor: "rgba(151,187,205,0.2)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                        }]
                }
            }
        };
    },

    componentDidMount: function () {
        this.getStatistics({'category': this.state.category,
                          'month': this.state.month});
    },

    onDurationChange: function (e) {
        this.getStatistics({'category': this.state.category,
                           'duration': e.target.value,
                           'month': this.state.month});
        this.setState({has_chart: false});
    },

    onNetworkChange: function (e) {
        this.getStatistics({'category': e.target.value,
                        'duration': this.state.duration,
                        'month': this.state.month});
        this.setState({has_chart: false});
    },

    onMonthChange: function (e) {
        var month = moment(e + '-01');

        if (!month.isValid()) {
            return false;
        }

        month = month.format('YYYY-MM');

        this.getStatistics({'category': this.state.category,
                           'duration': this.state.duration,
                           'month': month});
        this.setState({has_chart: false, month: month});
    },

    getStatistics: function (param) {
        var count = 0,
            that = this,
            month;

        that.setState({loader: true});

        new ChannelStats(param, function (err, data) {

            if (err) {
                that.setState({loader: false, error: true});

                return;
            }

            if (!data.body.results.length) {
                that.setState({has_chart: false, loader: false});
            }

            data.body.results.forEach(function (row) {
                month = moment(row.month + '-01').format('MMM YYYY');

                if (count === 0) {
                    that.state.charts.views.labels = [];
                    that.state.charts.subscribers.labels = [];
                    that.state.charts.views.datasets[0].data = [];
                    that.state.charts.subscribers.datasets[0].data = [];
                }

                that.state.charts.views.labels.push(month);
                that.state.charts.subscribers.labels.push(month);

                that.state.charts.views.datasets[0].data.push(row.views);
                that.state.charts.subscribers.datasets[0].data.push(row.subscribers);
                count++;
            });

            that.setState({
                has_chart: true,
                loader: false,
                error: false,
                charts: that.state.charts,
                channels: data.body.channels,
                category: React.findDOMNode(that.refs.select_category).value,
                duration: React.findDOMNode(that.refs.select_duration).value
            });
        });
    },

    render: function () {
        var loader,
            error,
            elem,
            default_month = new Date();

        default_month.setMonth(default_month.getMonth() - 1);

        if (this.state.error) {
            error = (
                    <div className='row'>
                        <div className='col s12'>
                            <div className='section' style={{'textAlign':'center'}}>
                            Error occured
                            </div>
                        </div>
                    </div>
            );
        }

        if (this.state.has_chart) {
            if (this.state.channels.length) {
                var subs_length = this.state.charts.subscribers.datasets[0].data.length,
                    views_length = this.state.charts.views.datasets[0].data.length,

                    old_subs = this.state.charts.subscribers.datasets[0].data[0],
                    new_subs = this.state.charts.subscribers.datasets[0].data[subs_length-1],

                    old_views = this.state.charts.views.datasets[0].data[0],
                    new_views = this.state.charts.views.datasets[0].data[subs_length-1];

                this.state.charts.subscribers.datasets.label = "Subscribers : " + (((new_subs - old_subs)/old_subs) * 100).toFixed(2) + "%";
                this.state.charts.views.datasets.label = "Views : " + (((new_views - old_views)/old_views) * 100).toFixed(2) + "%";
            }

            elem = (
                <div className='col s12'>
                    <div className='section'>
                        <p>Total number of channels: { parseInt(this.state.channels.length).toLocaleString() }</p>
                        <p>Displaying From { moment(this.state.month + '-01').subtract(this.state.duration, 'month').format('YYYY-MM') } to { this.state.month } </p>
                    </div>

                    <div className='section'>
                        <h5>{this.state.charts.views.datasets.label}</h5>
                        <LineChart data = {this.state.charts.views}
                        width={"900px"} height={"500px"} redraw
                        options = {this.state.chart_options}
                        />
                    </div>
                    <div className='divider'></div>
                    <div className='section'>
                        <h5>{this.state.charts.subscribers.datasets.label}</h5>
                        <LineChart data = {this.state.charts.subscribers}
                        width={"900px"} height={"500px"} redraw
                        options = {this.state.chart_options}
                        />
                    </div>
                </div>
                );
        }

        if ((!this.state.loader && !this.state.has_chart) && !this.state.error) {
            error = (
                <div className='row'>
                    <div className='col s12'>
                        <div className='section' style={{'textAlign':'center'}}>
                        No result
                        </div>
                    </div>
                </div>
                )
        }

        if (this.state.loader) {
            loader = (
            <div className='col s12 center-align'>
                <div className = 'section'>
                    <div className='preloader-wrapper small active'>
                        <div className='spinner-layer spinner-green-only'>
                            <div className='circle-clipper left'>
                                <div className='circle'></div>
                            </div><div className='gap-patch'>
                                <div className='circle'></div>
                            </div><div className='circle-clipper right'>
                                <div className='circle'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
        }

        return (
            <div className = 'row'>
                <div className='section'>
                    <div className= 'col s12'>
                    <h6>Category</h6>
                    <select id = 'sel-network' ref = 'select_category' onChange = {this.onNetworkChange}>
                        <option value = "anytv_affiliate">Affiliated 1</option>
                        <option value = "anytv_affiliate2">Affiliated 2</option>
                        <option value = "anytv_affiliate3">Affiliated 3</option>
                        <option value = "anytv">Managed</option>
                        <option value = "anytv_statuslife">Life</option>
                        <option value = "anytv_irl">IRL</option>
                        <option value = "anytv_beat">Beat</option>
                        <option value = "anytv_mgn">MGN</option>
                    </select>
                    </div>
                </div>
                <div className='section'>
                    <div className= 'col s6'>
                        <h6>Base month</h6>
                        <DTPicker initialView={'year'}
                            time={false} format={'MMMM yyyy'}
                            onChange={this.onMonthChange}
                            defaultValue={default_month}
                            max={default_month} min={moment('2013-12-01')}/>
                    </div>
                    <div className= 'col s6'>
                        <h6>Age duration</h6>
                        <select id = 'sel-duration' ref = 'select_duration' onChange = {this.onDurationChange}>
                            <option value = "2">2</option>
                            <option value = "3">3</option>
                            <option value = "4">4</option>
                            <option value = "5">5</option>
                            <option value = "6">6</option>
                            <option value = "7">7</option>
                            <option value = "8">8</option>
                            <option value = "9">9</option>
                            <option value = "10">10</option>
                            <option value = "11">11</option>
                            <option value = "12">12</option>
                        </select>
                    </div>
                </div>
                {error}
                {loader}
                {elem}
            </div>
        );
    }
});
