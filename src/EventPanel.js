var React = require('react');
var ReactIntl = require('react-intl');
var FormattedDate = ReactIntl.FormattedDate;
var Remarkable = require('remarkable');
var md = new Remarkable();
var Link = require('react-router').Link;


var EventPanel = React.createClass({

  render: function () {
      var ev = this.props.ev;
      var date = 'not defined';
      if(ev.milestone && ev.milestone.due_on) {
        date = ev.milestone.due_on;
      }
      var eventDescription = md.render(ev.body);
      return (
            <div styles={{marginTop: 50}} key={ev.id} className="panel panel-default">
              <div className="panel-heading">
                <Link to="event" params={{groupName: this.props.group.name, eventId: ev.number}}>
                  <span>{ev.title}</span>
                </Link>
                <strong styles={{float:'right'}}>
                  <FormattedDate value={date} day="numeric"
                  month="long"
                  year="numeric" /></strong>
              </div>
              <div className="panel-body" dangerouslySetInnerHTML={{__html: eventDescription}}>
              </div>
            </div>
            )
  }
});

module.exports = EventPanel;