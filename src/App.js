var async = require('async');
var React = require('react');
var Github = require('github-api');
var ReactGridLayout = require('react-grid-layout');
var StyleSheet = require('react-style')


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
var Discussion = require('./Discussion');
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
    var eventsList = events.map(function (ev) {
      return (<EventPanel ev={ev} group={this.state.group}/>)
    }.bind(this));
    var discussionsList = questions.map(function (question) {
      return (<DiscussionPanel discussion={question} group={this.state.group}/>)
    }.bind(this));
    var pollsList = [];
    var content;
    if (Object.keys(this.state.group || {}).length ) {
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
                      <p>Coming soon..</p>
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








var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Index}/>
    <Route name="group" path="/groups/:groupName/" handler={Group} />
    <Route name="event" path="/groups/:groupName/events/:eventId/" handler={Event} />
    <Route name="discussion" path="/groups/:groupName/discussions/:discussionId/" handler={Discussion} />

  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
  console.log('run');
  React.render(<Handler/>, document.getElementById('app'));
});

