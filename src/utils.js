var async = require('async');
var request = require('superagent');
var oauth = require('./oauth');

exports.fetchMeta = function (github, group, callback) {
  var groupRepo = github.getRepo('meetups', group.name);
  groupRepo.read('master', 'meetup.json', function(err, data) {
    if (err) {
      return callback(err);
    }
    var meta = JSON.parse(data);
    group.logo = meta.logo;
    group.cssurl = meta.css;
    callback(null, group);
  });
};


exports.fetchCSS = function (github, group, callback) {
  var groupRepo = github.getRepo('meetups', group.name);
  groupRepo.read('master', 'styles.css', function(err, data) {
    if (err) {
      group.css = ''
      return callback(null, group);
    }
    group.css = data;
    callback(null, group);
  });
};


exports.fetchGroup = function (github, groupName, callback) {
  var groupRepo = github.getRepo('meetups', groupName);
  groupRepo.show(function(err, group) {
    if (err) {
      return callback(err);
    }
    async.parallel({
      meta: exports.fetchMeta.bind(null, github, group),
      css: exports.fetchCSS.bind(null, github, group)
    }, function (err, results) {
      if (err) {
        return callback(err);
      }
      console.log('fetched repo', results, group);
      callback(null, group);
    });
  })
};

exports.fetchEvents = function (groupName, type, callback) {
  var issueUrl = 'https://api.github.com/repos/meetups/' + groupName + '/issues?labels=' + type;
  var tokenHeader = 'token ' + oauth.token;
  request.get(issueUrl).set('Authorization', tokenHeader).end(function (err, res) {
    if (err) {
      return callback(err);
    }
    callback(null, res.body);
  });
}


exports.fetchEvent = function (groupName, issueNumber, callback) {
  var issueUrl = 'https://api.github.com/repos/meetups/' + groupName + '/issues/' + issueNumber;
  var tokenHeader = 'token ' + oauth.token;
  request.get(issueUrl).set('Authorization', tokenHeader).end(function (err, res) {
    if (err) {
      return callback(err);
    }
    var ev = res.body;
    var commentsUrl = issueUrl + '/comments';
    request.get(issueUrl).set('Authorization', tokenHeader).end(function (err, res) {
      if (err) {
        return callback(null, ev);
      }
      var comments = res.body;
      ev.comments = comments;
      callback(null, ev)
    });
  });
}
