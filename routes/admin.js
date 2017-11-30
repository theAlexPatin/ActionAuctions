var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;
var tools = require('../tools');

router.get('/', function(req, res, next) {
	res.render('admin');
});

router.post('/', function(req, res, next){
	var data = req.body;
	params={
		TableName:"Auctions",
		Item:{
			"auction_id":data['auction_id'],
			"charity":data['charity'].replace('/',''),
			"city":data['city'].replace('/',''),
			"state":data['state'],
			"location":data['location'].replace('/', ''),
			"description":data['description'],
			"ending_time":data['ending_time'],
			"image":data['image'],
			"link":data['link'],
			"highest_bid":0,
			"has_ended":false,
			"current_amt":0,
			"payment_status":"pending"
		}
	}
	ddb.put(params, function(err, body){
		if(err){
			console.log("error creating auction");
			console.log(err);
		}
		else{
			tools.start_job(data['auction_id'], data['ending_time']);
			res.render('admin');
		}
	})
});

module.exports = router;