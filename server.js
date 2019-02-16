var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

if (process.env.ENVIRO != "PROD") require('dotenv').config();

var port = process.env.PORT || 1337;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  console.log('Req made');
  next();
});

app.use(express.static('public'));

app.route('/alarms')
    .post(function(req, res) {
        console.log(req.body.alarmTime);
        res.send("test");
        // var request = new Request(
        //     "SELECT * FROM Alarms",
        //     function(err, rowCount, rows)
        //     {
        //         console.log(rows);
        //     }
        // );
        // request.on('doneInProc', function (rowCount, more, rows) {
        //     var jsonArray = [];
        //     rows.forEach(function (columns) {
        //         var rowObject ={};
        //         columns.forEach(function(column) {
        //             rowObject[column.metadata.colName] = column.value;
        //         });
        //         jsonArray.push(rowObject);
        //     });
        //     return res.json(jsonArray);
        // });
        // connect(request);
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

app.route('/events')
    .get(function(req, res) {
        var request = new Request(
            "SELECT * FROM EVENTS",
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