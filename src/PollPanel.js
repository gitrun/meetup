var React = require('react');
var ReactIntl = require('react-intl');
var FormattedDate = ReactIntl.FormattedDate;
var Remarkable = require('remarkable');
var md = new Remarkable();
var Link = require('react-router').Link;


var PollPanel = React.createClass({

  render: function () {
      var poll = this.props.poll;
      var description = md.render(poll.body);
      return (
            <div styles={{marginTop: 50}} key={poll.id} className="panel panel-default">
              <div className="panel-heading">
                <Link to="poll" params={{groupName: this.props.group.name, pollId: poll.number}}>
                  <span>{poll.title}</span>
                </Link>
              </div>
              <div className="panel-body" dangerouslySetInnerHTML={{__html: description}}>
              </div>
            </div>
            )
  }
});

module.exports = PollPanel;