var async = require('async');
var React = require('react');
var Github = require('github-api');
var ReactGridLayout = require('react-grid-layout');
var StyleSheet = require('react-style')
var Pie = require('react-pie');
var ReactIntl = require('react-intl');
var FormattedDate = ReactIntl.FormattedDate;
var PieChart = require("react-chartjs").Pie;
var Remarkable = require('remarkable');
var md = new Remarkable();

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var PollPanel = require('./PollPanel');
var DiscussionPanel = require('./DiscussionPanel');
var Attendees = require('./Attendees');
var GroupHeader = require('./GroupHeader');
var oauth = require('./oauth');

console.log('dasdasd', Pie);
var utils = require('./utils');


var Poll = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function () {
    return {
      poll: {},
      group: {}
    }
  },

  componentWillMount: function () {
    this.github = new Github(oauth);
    this.githubUser = this.github.getUser();
  },

  componentDidMount: function () {
    console.log('xxxxx', this.getParams());
    utils.fetchEvent(this.getParams().groupName, this.getParams().pollId, function (err, poll) {
      console.log('fulll poll', err, poll);
      this.setState({poll: poll});
    }.bind(this));
    utils.fetchGroup(this.github, this.getParams().groupName, function (err, group) {
      console.log('done', err, group);
      this.setState({group: group});
    }.bind(this))
  },

  getData: function () {
    var comments = this.state.poll.comments || [];
    var votedYes = comments.filter(function (comment) {
      return comment.body.indexOf('+1') > -1;
    });
    var votedNo = comments.filter(function (comment) {
      return comment.body.indexOf('-1') > -1;
    });
    var data = [
      {
        label: 'Yes',
        color:"#F7464A",
        highlight: "#FF5A5E",
        value: (votedYes.length/comments.length)*100
      },
      {
        label: 'No',
        color:"#46BFBD",
        highlight: "#5AD3D1",
        value: (votedNo.length/comments.length)*100
      }
    ]
    return data;
  },
  getCommenters: function () {
    var comments = this.state.poll.comments || [];
    var attendees = comments.map(function (comment) {
      return comment.user;
    });
    return attendees;
  },

  render: function (){
    var content;
    var data = this.getData();


    var commenters = this.getCommenters();
    if (Object.keys(this.state.group).length > 0 && Object.keys(this.state.poll).length > 0) {
      content = <div>
                  <link href={this.state.group.cssurl} rel="stylesheet"/>
                  <style>
                    {this.state.group.css}
                  </style>
                  <GroupHeader group={this.state.group}/>
                  <PollPanel poll={this.state.poll} group={this.state.group}/>
                  <Attendees attendees={commenters}/>
                  <PieChart data={data}/>
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


module.exports = Poll;
