var React = require('react');

var Attendees = React.createClass({
  render: function () {
    console.log('attendees', this.props.attendees);
    return (
      <div className="btn-group btn-group-justified">
      {
        this.props.attendees.map(function(attendee) {
          return (
            <button style={{width: 60}}type="button" className="btn btn-default" data-container="body" data-toggle="popover" data-placement="top" data-content={attendee.login} data-original-title="" title={attendee.login}>
              <img src={attendee.avatar_url} styles={{width: 30}}/>
            </button>
            )
        })
      }
      </div>
      )
  }
});

module.exports = Attendees;