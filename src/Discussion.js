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

var Discussion = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function () {
    return {
      discussion: {},
      group: {}
    }
  },

  componentWillMount: function () {
    this.github = new Github(oauth);
    this.githubUser = this.github.getUser();
  },

  componentDidMount: function () {
    utils.fetchEvent(this.getParams().groupName, this.getParams().discussionId, function (err, discussion) {
      console.log('fulll discussion', err, discussion);
      this.setState({discussion: discussion});
    }.bind(this));
    utils.fetchGroup(this.github, this.getParams().groupName, function (err, group) {
      console.log('done', err, group);
      this.setState({group: group});
    }.bind(this))
  },

  getCommenters: function () {
    var comments = this.state.discussion.comments || [];
    var attendees = comments.map(function (comment) {
      return comment.user;
    });
    return attendees;
  },

  render: function (){
    var content;
    var comments = this.state.discussion.comments || [];
    var attendees = this.getCommenters();
    if (Object.keys(this.state.group).length > 0 && Object.keys(this.state.discussion).length > 0) {
      content = <div>
                  <link href={this.state.group.cssurl} rel="stylesheet"/>
                  <style>
                    {this.state.group.css}
                  </style>
                  <GroupHeader group={this.state.group}/>
                  <DiscussionPanel discussion={this.state.discussion} group={this.state.group}/>
                  <Attendees attendees={attendees}/>
                  <Comments comments={comments} />
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

var Comments = React.createClass({

  render: function () {
    var comments = this.props.comments;
    var content = comments.map(function(comment){
      var body = md.render(comment.body);
      return (
        <div className="panel panel-default">
          <div className="panel-heading">
          <img styles={{width: 30, marginRight: 15}}src={comment.user.avatar_url}/>
          <strong>{comment.user.login}</strong>
          <strong styles={{float:'right'}}>
            <FormattedDate value={comment.updated_at} day="numeric"
            month="long"
            year="numeric" /></strong>
          </div>
          <div className="panel-body" dangerouslySetInnerHTML={{__html: body}}>
          </div>
        </div>)
    })
    return (
        <div styles={{marginTop: 30}}>{content}</div>
      )
  }

});

module.exports = Discussion;