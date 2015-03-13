var express = require('express');

var app = express();


app.use(express.static(__dirname + '/public'));

app.use('/groups/:name', express.static(__dirname + '/public'));
app.use('/groups/:name/events/:id', express.static(__dirname + '/public'));
app.use('/groups', express.static(__dirname + '/public'));


var port = process.env.PORT || 3000;
app.listen(port, function (err) {
  if (err) {
    console.error('failed to start the server');
  } else {
    console.error('server start on the port', port);
  }

});