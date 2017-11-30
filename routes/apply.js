var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;
var tools = require('../tools');

router.get('/', function(req, res, next) {
	res.render('apply');
});

router.post('/', function(req, res, next){
	var data = req.body;
	console.log(data);
	var item = {
		"auction_id":data['auction_id'],
		"name":data['name'],
		"email":data['email'],
		"charity":data['charity'],
		"link":data['link'],
		"city":data["city"],
		"state":data['state'],
		"location":data['location'],
		"start_time":data['starting_time'],
		"end_time":data['ending_time']
	};
	if (data['description'] != undefined)
		item['description'] = data['description'];
	if (data['optional'] != undefined)
		item['optional'] = data['optional'];
	var params = {
		TableName:"Applications",
		Item:item
	};
	ddb.put(params, function(err, data){
		if(err){
			console.log(err);
			res.redirect('/');
		} else{
			res.render('app-received');
		}
	});
});

module.exports = router;