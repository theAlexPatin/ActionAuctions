var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;
var STRIPE_API_KEY = modules.STRIPE_API_KEY;
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;

router.post('/', function(req, res, next) {
	console.log(req.body.auction_id);
	var params = {
		TableName: "Auctions",
		Key:{
			"auction_id":req.body.auction_id
		}
	};
	ddb.get(params, function(err, data){
		if (err){
        	res.redirect('/');
		}
	    else {
	    	context = data['Item'];
	    	context['STRIPE_PUBLIC_KEY'] = STRIPE_PUBLIC_KEY;
	    	context['stripe_key'] = STRIPE_API_KEY;
	        res.render('donate', context);
	    }
	});
});

router.get('/', function(req, res, next){
	res.redirect('/');
});

module.exports = router;