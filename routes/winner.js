var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;
var stripe = require('stripe')(modules.STRIPE_API_KEY);
var STRIPE_CLIENT_ID = modules.STRIPE_CLIENT_ID;
var host = modules.base_url;

router.get('/:winner_id', function(req, res, next) {
	var winner_id = req.params.winner_id;
	var params = {
		TableName:"Bids",
		Key:{
			'bidder_id': winner_id
		}
	}
	ddb.get(params, function(err, data){
		if (err){
			console.log('error fetching bidder');
			res.redirect('/');
		} else{
			bid_data = data['Item'];
			params = {
				TableName:"Auctions",
				Key:{
					'auction_id':bid_data['auction_id']
				}
			}
			ddb.get(params, function(err,data){
				if (err){
					console.log('error fetching auction data');
					res.redirect('/');
				} else{
					data = data['Item'];
					if(data['winner_url'] !== winner_id)
						res.redirect('/');
					if(('reimbursed' in data && data['reimbursed']) || 'donated' in data)
						res.redirect('/');
					context = bid_data;
					context['charity'] = data['charity'];
					context['total'] = parseFloat(new String(Math.floor(data['current_amt'])/100)).toFixed(2);
					context['amount_won'] = parseFloat(new String(Math.floor(data['current_amt'] / 2)/100)).toFixed(2);
					var redirect = host+'/payout';
					context['redirect_uri'] = 'https://connect.stripe.com/express/oauth/authorize?redirect_uri='+redirect+'&client_id='+STRIPE_CLIENT_ID+'&state='+winner_id;
					res.render('winner', context);
				}
			});
		}
	});
	
});


router.post('/:winner_id', function(req, res, next){
	var winner_id = req.params.winner_id;
	var auction_id = req.body.auction_id;
	var donate = req.body.donate;
	params={
		TableName:"Auctions",
		Key:{"auction_id":auction_id},
		UpdateExpression:"set donated=:d",
		ExpressionAttributeValues:{
		    ":d":true
		}
	}
	ddb.update(params, function(err,data){
		if (err){
			console.log('unable to update auction item');
		} else{
			if(donate)
				res.render('forfeit')
		}
	});
});

module.exports = router;
