var async = require('async');
var React = require('react');
var Github = require('github-api');
var ReactGridLayout = require('react-grid-layout');
var StyleSheet = require('react-style')

var ViewCount = require('react-count').ViewCount;
var OnlineCount = require('react-count').OnlineCount;

var Remarkable = require('remarkable');
var md = new Remarkable();

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var EventPanel = require('./EventPanel');
var DiscussionPanel = require('./DiscussionPanel');
var PollPanel = require('./PollPanel');
var Attendees = require('./Attendees');
var Discussion = require('./Discussion');
var Event = require('./Event');
var Poll = require('./Poll');
var GroupHeader = require('./GroupHeader');
var oauth = require('./oauth');



var utils = require('./utils');

var App = React.createClass({

  render: function () {

    return (
      <div className="container-fluid">
        <RouteHandler/>
      </div>
      )
  }

});

var Index = React.createClass({
  getInitialState: function () {
    return {
      groups: []
    }
  },

  componentWillMount: function () {
    this.github = new Github(oauth);
    this.githubUser = this.github.getUser();
  },

  componentDidMount: function () {
    this.githubUser.orgRepos('meetups', function(err, groups) {
      this.setState({
        groups: groups
      });
      async.map(groups, utils.fetchMeta.bind(null, this.github), function (err, groups) {
        console.log('new groups', groups);
        this.setState({
          groups: groups
        });
      }.bind(this));
    }.bind(this));
  },

  render: function () {
    var groups = this.state.groups;
    var groupsList = groups.map(function (group) {
      console.log('all groups', group);
      return (<div key={group.name} className="panel panel-default">
               <div className="panel-heading">
                  <img src={group.logo} style={{width:30, marginRight: 20}}/>
                  <Link to="group" params={{groupName: group.name}}>
                    <span>{group.name}</span>
                  </Link>
                </div>
                <div className="panel-body">
                  <p>{group.description}</p>
                </div>
               <div className="panel-footer">
                  <span>10 members</span>
                </div>
              </div>)
    });
    return (
      <div className="row col-md-8 col-md-offset-2">
        <link href="https://bootswatch.com/paper/bootstrap.css" rel="stylesheet"/>
        <h1 className="text-center">Groups</h1>
        {groupsList}
        <RouteHandler/>
      </div>
      )
  }

});

var Group = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function () {
    return {
      events: [],
      questions: [],
      polls: [],
      group: {},
      selectedTab: 'events'
    }
  },

  componentWillMount: function () {
    this.github = new Github(oauth);
  },

  componentDidMount: function () {
    utils.fetchEvents(this.getParams().groupName, 'event', function(err, events) {
      console.log('events', events);
      this.setState({events: events});
    }.bind(this));

    utils.fetchEvents(this.getParams().groupName, 'question', function(err, questions) {
      console.log('questions', questions);
      this.setState({questions: questions});
    }.bind(this));

    utils.fetchEvents(this.getParams().groupName, 'poll', function(err, polls) {
      console.log('poll', polls);
      this.setState({polls: polls});
    }.bind(this));

    utils.fetchGroup(this.github, this.getParams().groupName, function (err, group) {
      console.log('done', err, group);
      this.setState({group: group});
    }.bind(this))
  },

  selectTab: function (name) {
    this.setState({
      selectedTab: name
    });
  },
  render: function (){
    var events = this.state.events || [];
    var questions = this.state.questions || [];
    var polls = this.state.polls || [];
    var eventsList = events.map(function (ev) {
      return (<EventPanel ev={ev} group={this.state.group}/>)
    }.bind(this));
    var discussionsList = questions.map(function (question) {
      return (<DiscussionPanel discussion={question} group={this.state.group}/>)
    }.bind(this));
    var pollsList = polls.map(function (poll) {
      return (<PollPanel poll={poll} group={this.state.group}/>)
    }.bind(this));
    var content;
    if (Object.keys(this.state.group).length > 0 ) {
      content = <div>
                  <link href={this.state.group.cssurl} rel="stylesheet"/>
                  <style>
                    {this.state.group.css}
                  </style>
                  <GroupHeader group={this.state.group}/>
                  <div>
                    <ul className="nav nav-tabs">
                      <li className={this.state.selectedTab === 'events' ? 'active' : ''}><a onClick={this.selectTab.bind(null, 'events')} href="#" data-toggle="tab" aria-expanded="true">Events</a></li>
                      <li className={this.state.selectedTab === 'discussions' ? 'active' : ''}><a onClick={this.selectTab.bind(null, 'discussions')} href="#" data-toggle="tab" aria-expanded="true">Discussions</a></li>
                      <li className={this.state.selectedTab === 'polls' ? 'active' : ''}><a onClick={this.selectTab.bind(null, 'polls')} href="#" data-toggle="tab" aria-expanded="true">Polls</a></li>
                    </ul>
                  <div className="tab-content">
                    <div  className={this.state.selectedTab === 'events' ? 'tab-pane fade active in' : 'tab-pane'}>
                      {eventsList}
                    </div>
                    <div className={this.state.selectedTab === 'discussions' ? 'tab-pane fade active in' : 'tab-pane'}>
                      {discussionsList}
                    </div>
                    <div className={this.state.selectedTab === 'polls' ? 'tab-pane fade active in' : 'tab-pane'}>
                      {pollsList}
                    </div>
                  </div>
                </div>
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








var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Index}/>
    <Route name="group" path="/groups/:groupName/" handler={Group} />
    <Route name="event" path="/groups/:groupName/events/:eventId/" handler={Event} />
    <Route name="discussion" path="/groups/:groupName/discussions/:discussionId/" handler={Discussion} />
    <Route name="poll" path="/groups/:groupName/polls/:pollId/" handler={Poll} />

  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
  console.log('run');
  React.render(<Handler/>, document.getElementById('app'));
});

