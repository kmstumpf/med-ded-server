var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var time = require('time')(Date);

if (process.env.ENVIRO != "PROD") require('dotenv').config();

const client = require('twilio')(process.env.twilioSID, process.env.twilioAuth);

var port = process.env.PORT || 1337;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  console.log('Req made');
  next();
});

app.use(express.static('public'));

poll();

app.route('/alarms')
    .post(function(req, res) {
        console.log(req.body.alarmTime);
        var request = new Request(
            "INSERT INTO DBO.ALARMS (ALARMTIME) VALUES ('" + req.body.alarmTime + "')",
            function(err, rowCount, rows)
            {
                console.log(rows);
            }
        );
        connect(request);
        return res.send("Done");
    })
    .get(function(req, res) {
        var request = new Request(
            "SELECT * FROM Alarms",
            function(err, rowCount, rows)
            {
                console.log(rows);
            }
        );
        request.on('doneInProc', function (rowCount, more, rows) {
            var jsonArray = [];
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject);
            });
            return res.json(jsonArray);
        });
        connect(request);
    });

app.route('/alarms/del')
    .post(function(req, res) {
        console.log(req.body.alarmTime);
        var request = new Request(
            "DELETE FROM DBO.ALARMS WHERE ALARMTIME = '" + req.body.alarmTime + "'",
            function(err, rowCount, rows)
            {
                console.log(rows);
            }
        );
        connect(request);
        return res.send("Done");
    });

app.route('/events')
    .get(function(req, res) {
        var request = new Request(
            "SELECT TOP(25) * FROM EVENTS ORDER BY EVENTTIME",
            function(err, rowCount, rows)
            {
                console.log(rows);
            }
        );
        request.on('doneInProc', function (rowCount, more, rows) {
            var jsonArray = [];
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject);
            });
            return res.json(jsonArray);
        });
        connect(request);
    });

app.listen(port);

//SQL connection helper functions

function connect(request) {
    var config =
    {
        userName: process.env.user, // update me
        password: process.env.pass, // update me
        server: process.env.db, // update me
        options:
        {
            database: process.env.dbname, //update me
            encrypt: true,
            rowCollectionOnDone: true
        }
    }
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err)
        {
            console.log(err)
        }
        else
        {
            connection.execSql(request);
        }
    });
}

//polling functions

function getTime() {
    var now = new Date();
    now.setTimezone('EST');
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var hString = hours.toString();
    var mString = minutes.toString();
    if (hours < 10){
        hString = "0" + hours.toString();
    }
    if (minutes < 10) {
        mString = "0" + minutes.toString();
    }
    return hString + ":" + mString;
}

function poll() {
    setTimeout(function() {
        var request = new Request(
            "SELECT * FROM Alarms",
            function(err, rowCount, rows)
            {
                console.log(rows);
            }
        );
        request.on('doneInProc', function (rowCount, more, rows) {
            var jsonArray = [];
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject);
            });
            console.log(getTime());
            jsonArray.forEach((elem) => {
                if (elem.alarmTime == getTime()) {
                    client.messages.create(
                        {
                          to: process.env.myNum,
                          from: process.env.twilioNum,
                          body: 'Take your drugs!',
                        },
                        (err, message) => {
                          console.log(message.sid);
                        }
                      );
                }
            });
        });
        connect(request);
        poll();
    }, 600);
}
