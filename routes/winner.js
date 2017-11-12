var express = require('express');
var router = express.Router();
var modules = require('../app');
var ddb = modules.ddb;
var stripe = require('stripe')(modules.STRIPE_API_KEY);

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
					if('reimbursed' in data || 'donated' in data)
						res.redirect('/');
					context = bid_data;
					context['charity'] = data['charity'];
					context['total'] = parseFloat(new String(Math.floor(data['current_amt'])/100)).toFixed(2);
					context['amount_won'] = parseFloat(new String(Math.floor(data['current_amt'] / 2)/100)).toFixed(2);
					res.render('winner', context);
				}
			});
		}
	});
	
});

router.post('/:winner_id', function(req, res, next){
	var winner_id = req.params.winner_id;
	if (req.body.donate == 'true')
		var donate = true;
	else
		var donate = false;
	var auction_id = req.body.auction_id;
	if (donate)
		var key = 'donated';
	else
		var key = 'reimbursed';
	params={
		TableName:"Auctions",
		Key:{"auction_id":auction_id},
		UpdateExpression:"set "+key+"=:k",
		ExpressionAttributeValues:{
		    ":k":true
		},
		ReturnValues:'ALL_NEW'
	}
	ddb.update(params, function(err,data){
		if (err){
			console.log('unable to update auction item');
		} else{
			if(donate)
				res.render('forfeit')
			else{
				auction_data = data['Attributes'];
				var params = {
					TableName:"Bids",
					Key:{"bidder_id":winner_id}
				}
				ddb.get(params, function(err, data){
					if(err){
						console.log('error retrieving bidder');
						res.redirect('/');
					} else{
						bid_data = data['Item'];
						stripe.payouts.create({
							amount:Math.floor(auction_data['current_amt'] / 2),
							currency:'usd',
							description:'Payout from Action Aucitons',
							destination:bid_data['card_id']
						}, function(err, payout){
							params={
								TableName:"Auctions",
								Key:{"auction_id":auction_id},
								UpdateExpression:"set payout_id=:p",
								ExpressionAttributeValues:{
									":p":payout['id']
								}
							}
							ddb.update(params, function(err,data){
								if (err){
									console.log('failed to store transaction');
								}
							});
							res.render('reimbursed');
						});

					}
				});
			}
		}
	});
});

module.exports = router;
