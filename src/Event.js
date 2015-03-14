var async = require('async');
var React = require('react');
var Github = require('github-api');
var ReactGridLayout = require('react-grid-layout');
var StyleSheet = require('react-style')

var ReactIntl = require('react-intl');
var FormattedDate = ReactIntl.FormattedDate;

var Remarkable = require('remarkable');
var md = new Remarkable();

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var EventPanel = require('./EventPanel');
var DiscussionPanel = require('./DiscussionPanel');
var Attendees = require('./Attendees');
var GroupHeader = require('./GroupHeader');
var oauth = require('./oauth');


var utils = require('./utils');


var Event = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function () {
    return {
      ev: {},
      group: {}
    }
  },

  componentWillMount: function () {
    this.github = new Github(oauth);
    this.githubUser = this.github.getUser();
  },

  componentDidMount: function () {
    utils.fetchEvent(this.getParams().groupName, this.getParams().eventId, function (err, ev) {
      console.log('fulll event', err, ev);
      this.setState({ev: ev});
    }.bind(this));
    utils.fetchGroup(this.github, this.getParams().groupName, function (err, group) {
      console.log('done', err, group);
      this.setState({group: group});
    }.bind(this))
  },

  getAttendees: function () {
    var comments = this.state.ev.comments || [];
    var attending = comments.filter(function (comment) {
      return comment.body.indexOf('+1') > -1;
    });
    var attendees = attending.map(function (comment) {
      return comment.user;
    });
    return attendees;
  },

  render: function (){
    var content;
    var attendees = this.getAttendees();
    if (Object.keys(this.state.group).length > 0 && Object.keys(this.state.ev).length > 0) {
      content = <div>
                  <link href={this.state.group.cssurl} rel="stylesheet"/>
                  <style>
                    {this.state.group.css}
                  </style>
                  <GroupHeader group={this.state.group}/>
                  <EventPanel ev={this.state.ev} group={this.state.group}/>
                  <Attendees attendees={attendees}/>
                </div>
    } else {
      content = <div className="progress">
                <div className="progress-bar"></div>
                </div>
    }
    return (<div className="row col-md-8 col-md-offset-2">
            {content}
            </div>

            )
  }
});


module.exports = Event;
