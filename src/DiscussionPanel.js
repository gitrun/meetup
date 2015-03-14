var React = require('react');
var ReactIntl = require('react-intl');
var FormattedDate = ReactIntl.FormattedDate;
var Remarkable = require('remarkable');
var md = new Remarkable();
var Link = require('react-router').Link;


var DiscussionPanel = React.createClass({

  render: function () {
      var discussion = this.props.discussion;
      var description = md.render(discussion.body);
      return (
            <div key={discussion.id} className="panel panel-default">
              <div className="panel-heading">
                <Link to="discussion" params={{groupName: this.props.group.name, discussionId: discussion.number}}>
                  <span>{discussion.title}</span>
                </Link>
              </div>
              <div className="panel-body" dangerouslySetInnerHTML={{__html: description}}>
              </div>
            </div>
            )
  }
});

module.exports = DiscussionPanel;