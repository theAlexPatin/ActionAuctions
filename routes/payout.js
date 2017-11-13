var express = require('express');
var router = express.Router();
var modules = require('../app');
var uuid = require('uuid/v1');
var request = require('request');
var ddb = modules.ddb;
var STRIPE_API_KEY = modules.STRIPE_API_KEY;
var stripe = require('stripe')(STRIPE_API_KEY);
var STRIPE_CLIENT_ID = modules.STRIPE_CLIENT_ID;
var host = modules.base_url;
var tools = require('../tools');

router.get('/', function(req, res, next){
	var winner_id = req.query.state;
	var auth_code = req.query.code;
	var options = {
		uri:'https://connect.stripe.com/oauth/token',
		method:'POST',
		json:{
			'code':auth_code,
			'client_secret':STRIPE_API_KEY,
			'grant_type':'authorization_code'
		}
	}
	request(options,function(error, response, body){
		if(error){
			console.log('error');
		} else{
			var acc_token= body.stripe_user_id;
			var refresh = body.refresh_token;
			stripe.accounts.retrieve(acc_token, function (err, acc) {
				var params = {
					TableName:'Bids',
					Key:{'bidder_id':winner_id},
					UpdateExpression:"set stripe_account=:s",
					ExpressionAttributeValues:{
						":s":acc.id
					},
					ReturnValues:'ALL_NEW'
				}
				ddb.update(params, function(err, data){
					if(err){
						console.log('error updating winner stripe account');
					} else{
						bidder_data = data['Item'];
						auction_id = bidder_data['auction_id'];
						params={
							TableName:'Auctions',
							Key:{'auction_id':auction_id},
							UpdateExpression:"set reimbursed=:r",
							ExpressionAttributeValues:{
								":r":true
							},
							ReturnValues:'ALL_NEW'
						}
						ddb.update(params, function(err, data){
							if (err){
								console.log('error updating auction data')
							} else{
								auction_data = data['Item'];
								var amount = Math.floor(auction_data['current_amt'] / 2);
								stripe.transfers.create({
									amount:amount,
									currency:'usd',
									destination:acc.id
								}, function(err, transfer){
									if(err){
										console.log('error issuing transfer');
										//set reimbursed to false
									} else{
										tools.payout_confirmation(
											bidder_data['first_name'], 
											parseFloat(new String(Math.floor(amount/100))).toFixed(2), 
											bidder_data['email']
										);
									}
								});
							}
						})
					}
				})
			});
		}
	});
});


module.exports = router;
