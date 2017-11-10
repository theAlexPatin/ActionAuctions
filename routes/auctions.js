var express = require('express');
var router = express.Router();
var modules = require('../app');
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
	        res.render('auction', data['Item']);
	    }
	});
});

module.exports = router;
