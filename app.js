/*External imports*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
/*Connect to DynamoDB*/
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

/*
GLOBAL VARIABLE DECLARATIONS
*/
exports.ddb = new AWS.DynamoDB.DocumentClient();;
exports.STRIPE_API_KEY = "sk_test_5touzY5sFtfwT0lBuwbvD4l6";
exports.STRIPE_PUBLIC_KEY = "pk_test_08b8DgWK3wRVmfdrhCtg3mVa";
exports.STRIPE_CLIENT_ID = 'ca_BI52uK0mUKaVbtZnW1rfg7LKfvgGoWFY';
exports.service_email = "charity_labs@yahoo.com";
exports.email_pass = "420Blazeit6969";
exports.base_url = "http://localhost:3000";
/*END DECLARATIONS*/

var app = express();

/*Route Imports*/
var index = require('./routes/index');
var auctions = require('./routes/auctions');
var donate = require('./routes/donate');
var charge = require('./routes/charge');
var winner = require('./routes/winner');
var test = require('./routes/test'); //Route used for testing anything that might require express stuff
var payout = require('./routes/payout');

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*Route links*/
app.use('/', index);
app.use('/auction/', auctions);
app.use('/donate/', donate);
app.use('/confirmation/', charge);
app.use('/winner/', winner);
app.use('/testing/', test);
app.use('/payout/', payout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
