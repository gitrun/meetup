var React = require('react');
var Link = require('react-router').Link;

var GroupHeader = React.createClass({

  render: function () {
    return (
      <div>
        <button className="btn btn-success pull-right">Join</button>
        <h2><Link to="group" params={{groupName: this.props.group.name}}> {this.props.group.name}</Link></h2>
        <p>{this.props.group.description}</p>
      </div>
      )
  }

});

module.exports= GroupHeader;