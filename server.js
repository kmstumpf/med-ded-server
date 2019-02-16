var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var port = process.env.PORT || 1337;

// Create connection to database
var config =
{
    userName: 'your_username', // update me
    password: 'your_password', // update me
    server: 'brains.database.windows.net', // update me
    options:
    {
        database: 'your_database', //update me
        encrypt: true
    }
}
//var connection = new Connection(config);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  console.log('Req made');
  next();
});

app.use(express.static('public'));

//get lastest replays, new replay
app.route('/alarms')
    .get(function(req, res) {
        return res.send(process.env.db);
    });

app.listen(port);