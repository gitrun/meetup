var React = require('react');
var Link = require('react-router').Link;
var Count = require('react-count');


var GroupHeader = React.createClass({

  render: function () {
    return (
      <div>
        <button className="btn btn-success pull-right">Join</button>
        <h2><Link to="group" params={{groupName: this.props.group.name}}> {this.props.group.name}</Link></h2>
        <p>{this.props.group.description}</p>
        <div>
          <Count className="pull-right" isViewCounter={true} counterText="views" firebaseHost="https://counter-button.firebaseio.com/" firebaseResourceId={'views-'+this.props.group.name}/>
          <Count className="pull-right" isOnlineCounter={true} counterText="online" firebaseHost="https://counter-button.firebaseio.com/" firebaseResourceId={'online-'+this.props.group.name}/>
          <Count className="pull-right" isButtonLast={true} actionDoText="like" actionDoneText="liked"  counterText="likes" firebaseHost="https://counter-button.firebaseio.com/" firebaseResourceId={'likes-'+this.props.group.name}/>
        </div>
      </div>
      )
  }

});

module.exports= GroupHeader;