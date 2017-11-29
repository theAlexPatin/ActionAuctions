var express = require('express');
var router = express.Router();
var uuid = require('uuid/v1');
var modules = require('../app');
var tools = require('../tools');
var dateFormat = require('dateformat');
var ddb = modules.ddb;
var STRIPE_API_KEY = modules.STRIPE_API_KEY;
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;
var stripe = require("stripe")(STRIPE_API_KEY);


function formValidation(data){
	if (data.amount == '' || data.first_name == '' || data.email == '')
		return false;
	var amount = Number(data.amount.replace(/[\$,]/g, ''));
	if (amount < 1 || amount > 100000){
		return false;
	}
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(data.email)){
    	console.log('here2');
		return false;
    }
	if (data.first_name == '' || data.first_name == null){
		return false;
	}
	// if (data.last_name == '' || data.last_name == null){
		// return false;
	// }
	return true;
};

router.post('/', function(req, res, next) {
	if (formValidation(req.body)){
		var amount = Number(req.body.amount.replace(/[\$,]/g, ''));
		amount = parseFloat(amount).toFixed(2);
		var email = req.body.email;
		var first_name = req.body.first_name;
		var last_name = req.body.last_name;
		var stripe_token = req.body.stripeToken;
		var auction_id = req.body.auction_id;
		var card_id = req.body.card_id;

		/*FETCH AUCTION DETAILS FROM DATABASE*/
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
		    	var now = new Date();
		    	var end_time = new Date(auction['ending_time']);
		    	if (now > end_time){
		    		render('out_of_time');
		    	}
		    	else{
		    		data = data['Item'];
			    	var end_time = dateFormat(data['ending_time'],'dddd, mmmm dS, yyyy "at" h:MM:ss TT');
			    	end_time = end_time.replace('"ap"', 'at');
			    	var charity = data['charity'];


			    	/*CHARGE TOKEN*/
			    	stripe.charges.create({
					  amount: Math.floor(amount*100),
					  currency: "usd",
					  source: stripe_token,
					  description: "Charge from Charity Labs"
					}, function(err, charge) {
						if (err)
							res.redirect('/payment-error');
						else{
							var charge_id = charge['id'];
							var date = dateFormat(new Date(),"isoDateTime");

							/*CREATE BID ENTRY IN DATABASE*/
							var bidder_id = "" + uuid()
				    		bidder_id = bidder_id.split('-').join('');
							var params = {
							    TableName:'Bids',
							    Item:{
							    	"bidder_id": bidder_id,
									"stripe_token":stripe_token,
									"charge_id":charge_id,
									"card_id":card_id,
									"first_name":first_name,
									"last_name":last_name,
									"auction_id":auction_id,
									"amount": Math.floor(amount*100),
									"email":email,
									"time":date,
									"payment_type":"stripe"
							    }
							};
							ddb.put(params, function(err, data) {
							    if (err) {
							        console.error("Unable to add item");
							    } else {
							        console.log("Added item");
							    }
							});

					    	/*UPDATE AUCTION DATABASE RECORD*/
					    	var current_amount = data['current_amt'] + Math.floor(amount*100);
					   		//If this bid is greater than previous highest, update that
					    	if(Math.floor(amount*100) > data['highest_bid']){
					    		var UpdateExpression = "set highest_bid=:h, highest_bidder=:b, current_amt=:c";
							    var ExpressionAttributeValues = {
							        ":c":current_amount,
							        ":h":Math.floor(amount*100),
							        ":b":bidder_id
							    };
					    	} else{
					    		var UpdateExpression = "set current_amt=:c";
							    var ExpressionAttributeValues = {
							        ":c":current_amount
							    };
					    	}
					    	var params = {
					    		TableName:"Auctions",
					    		Key:{
					    			"auction_id":auction_id
					    		},
					    		UpdateExpression: UpdateExpression,
					    		ExpressionAttributeValues: ExpressionAttributeValues,
					  			ReturnValues:"UPDATED_NEW"
					    	}
					    	ddb.update(params, function(err, data) {
							    if (err) {
							        console.error("Unable to update item.", JSON.stringify(err, null, 2));
							    } else {
							        console.log("UpdateItem succeeded");
							    }
							});

					    	/*EMAIL CONFIRMATION*/
					    	tools.payment_confirmation(charity, first_name, end_time, amount, email);

							/*RENDER CONFIRMATION PAGE*/
							context = data;
							context['auction_link'] = '/auction/'+data['auction_id'];
							console.log(context['auction_link']);
							context['first_name'] = first_name;
							context['amount'] = amount;
							context['end_time'] = end_time;
							delete context['highest_bidder'];
							delete context['highest_bid'];
							res.render('confirmation', context);
						}
					});
		    	}

		    }
		});
	} else{
		res.redirect('/auction/'+req.body.auction_id);
	}
});

router.get('/', function(req, res, next){
	res.redirect('/');
});



module.exports = router;
