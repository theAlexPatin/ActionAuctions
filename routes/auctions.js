var express = require('express');
var router = express.Router();
var modules = require('../app');
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;
var ddb = modules.ddb;
var tools = require('../tools');

router.get('/:auction_id', function(req, res, next) {
	var auction_id = req.params.auction_id.toLowerCase();
	var params = {
		TableName: "Auctions",
		Key:{
			"auction_id":auction_id
		}
	};
	ddb.get(params, function(err, data){
		if (err)
        	res.redirect('/');
	    else {
	    	if (data['Item'] == null)
	    		res.redirect('/');
	    	else{
	    		var context = data['Item'];

	    		var t_delta = (tools.modify_date(context['ending_time']) - new Date());
	    		context['time_left'] = t_delta;
		    	context['stripe_key'] = STRIPE_PUBLIC_KEY;
		      	res.render('auction', context);
	    	}
	    	
	    }
	});
});

module.exports = router;
