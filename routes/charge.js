var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;
var STRIPE_API_KEY = modules.STRIPE_API_KEY;
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;

router.post('/', function(req, res, next) {
	console.log(req.body);
});

router.get('/', function(req, res, next){
	res.redirect('/');
});

module.exports = router;