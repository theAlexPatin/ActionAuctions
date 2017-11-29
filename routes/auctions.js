var express = require('express');
var router = express.Router();
var modules = require('../app');
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;
var ddb = modules.ddb;

router.get('/:auction_id', function(req, res, next) {
	var params = {
		TableName: "Auctions",
		Key:{
			"auction_id":req.params.auction_id
		}
	};
	ddb.get(params, function(err, data){
		if (err)
        	res.redirect('/');
	    else {
	    	if (data['Item'] == null)
	    		res.redirect('/');
	    	var context = data['Item'];
	    	context['stripe_key'] = STRIPE_PUBLIC_KEY;
	      res.render('auction', context);
	    }
	});
});

module.exports = router;
