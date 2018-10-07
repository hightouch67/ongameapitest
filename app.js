const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http'),
  https = require('https');
http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// view engine setup
const hbs = require('hbs');
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public'), {maxAge: (86400000 * 7)}));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use('/', require('./routes/api'));

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(['error', {
    message: err.message,
    error: {}
  }]);
});

module.exports = app;
