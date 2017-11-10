var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;

/* GET home page. */
router.get('/:auction_id', function(req, res, next) {
	var params = {
		TableName: "Auctions",
		Key:{
			"auction_id":req.params.auction_id
		}
	};
	ddb.get(params, function(err, data){
		if (err) {
        	console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
	    } else {
	        res.render('auction', data['Item']);
	    }
	});
});

module.exports = router;
