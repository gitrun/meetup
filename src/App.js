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
    this.github = new Github({});
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
      group: {}
    }
  },

  componentWillMount: function () {
    this.github = new Github({});
    this.githubUser = this.github.getUser();
    this.issues = this.github.getIssues('meetups', this.getParams().groupName);
  },

  componentDidMount: function () {
    this.issues.list({labels: 'event'}, function(err, events) {
      console.log('events', events);
      this.setState({events: events});
    }.bind(this));

    utils.fetchGroup(this.github, this.getParams().groupName, function (err, group) {
      console.log('done', err, group);
      this.setState({group: group});
    }.bind(this))
  },

  render: function (){
    var events = this.state.events;
    var eventsList = events.map(function (ev) {
      var eventDescription = md.render(ev.body);
      return (<EventPanel ev={ev} group={this.state.group}/>)
    }.bind(this));
    var content;
    if (Object.keys(this.state.group).length ) {
      content = <div>
                  <link href={this.state.group.cssurl} rel="stylesheet"/>
                  <style>
                    {this.state.group.css}
                  </style>
                  <GroupHeader group={this.state.group}/>
                  <div>
                  <h4>Our upcoming events</h4>
                  {eventsList}
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
    this.github = new Github({});
    this.githubUser = this.github.getUser();
  },

  componentDidMount: function () {
    utils.fetchEvent(this.github, this.getParams().groupName, this.getParams().eventId, function (err, ev) {
      console.log('done', err, ev);
      this.setState({ev: ev});
    }.bind(this));
    utils.fetchGroup(this.github, this.getParams().groupName, function (err, group) {
      console.log('done', err, group);
      this.setState({group: group});
    }.bind(this))
  },

  render: function (){
    var content;
    if (Object.keys(this.state.group).length > 0 && Object.keys(this.state.ev).length > 0) {
      content = <div>
                  <link href={this.state.group.cssurl} rel="stylesheet"/>
                  <style>
                    {this.state.group.css}
                  </style>
                  <GroupHeader group={this.state.group}/>
                  <EventPanel ev={this.state.ev} group={this.state.group}/>
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



var EventPanel = React.createClass({

  render: function () {
      var ev = this.props.ev;
      var eventDescription = md.render(ev.body);
      return (
            <div key={ev.id} className="panel panel-default">
              <div className="panel-heading">
                <Link to="event" params={{groupName: this.props.group.name, eventId: ev.number}}>
                  <span>{ev.title}</span>
                </Link>
                <strong styles={{float:'right'}}>
                  <FormattedDate value={ev.milestone.due_on} day="numeric"
                  month="long"
                  year="numeric" /></strong>
              </div>
              <div className="panel-body" dangerouslySetInnerHTML={{__html: eventDescription}}>
              </div>
            </div>
            )
  }
});

var GroupHeader = React.createClass({

  render: function () {
    return (
      <div>
        <button className="btn btn-success pull-right">Join</button>
        <h2>{this.props.group.name}</h2>
        <p>{this.props.group.description}</p>
      </div>
      )
  }

});

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Index}/>
    <Route name="group" path="/groups/:groupName/" handler={Group} />
    <Route name="event" path="/groups/:groupName/events/:eventId/" handler={Event} />

  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
  console.log('run');
  React.render(<Handler/>, document.getElementById('app'));
});

