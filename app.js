/*External imports*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var sass = require('node-sass-middleware');

var AWS = require('aws-sdk');
var settings = require('./environment');
/*Connect to DynamoDB*/
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

/*
GLOBAL VARIABLE DECLARATIONS
*/
exports.ddb = new AWS.DynamoDB.DocumentClient();
exports.STRIPE_API_KEY = settings.STRIPE_API_KEY;
exports.STRIPE_PUBLIC_KEY = settings.STRIPE_PUBLIC_KEY;
exports.STRIPE_CLIENT_ID = settings.STRIPE_CLIENT_ID;
exports.service_email = settings.service_email;
exports.email_pass = settings.email_pass;
exports.base_url = settings.base_url;
/*END DECLARATIONS*/
var tools = require('./tools');
var app = express();


/*Route Imports*/
var index = require('./routes/index');
var auctions = require('./routes/auctions');
var charge = require('./routes/charge');
var winner = require('./routes/winner');
var test = require('./routes/test'); //Route used for testing anything that might require express stuff
var payout = require('./routes/payout');
var admin = require('./routes/admin');
var tos = require('./routes/tos');
var about = require('./routes/about');


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(helmet());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sass({
    /* Options */
    src: path.join(__dirname, 'styles'),
    dest: path.join(__dirname, 'public/css'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));
app.use(express.static(path.join(__dirname, 'public')));

/*Route links*/
app.use('/', index);
app.use('/auction/', auctions);
app.use('/confirmation/', charge);
app.use('/winner/', winner);
app.use('/testing/', test);
app.use('/payout/', payout);
app.use('/admin/', admin);
app.use('/tos/', tos);
app.use('/about/', about);

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

tools.restart_jobs(exports.ddb);
