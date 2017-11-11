var express = require('express');
var router = express.Router();
var modules = require('../app');
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
var ddb = modules.ddb;
var STRIPE_API_KEY = modules.STRIPE_API_KEY;
var STRIPE_PUBLIC_KEY = modules.STRIPE_PUBLIC_KEY;
var service_email = modules.service_email;
var email_pass = modules.email_pass;


var transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: service_email,
    pass: email_pass
  }
});

router.post('/', function(req, res, next) {
	var amount = req.body.amount;
	var email = req.body.email;
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var stripe_token = req.body.stripeToken;
	var auction_id = req.body.auction_id;

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
	    	data = data['Item'];
	    	var end_time = dateFormat(data['ending_time'],'dddd, mmmm dS, yyyy "at" h:MM:ss TT');
	    	end_time = end_time.replace('"ap"', 'at');
	    	var charity = data['charity'];
	    	/*CHARGE TOKEN*/

	    	/*CREATE BID ENTRY IN DATABASE*/

	    	/*UPDATE AUCTION IF NECESSARY*/


	    	/*SEND EMAIL*/
	    	var mailOptions = {
			  from: service_email,
			  to: email,
			  subject: `Confirming your Donation to ${charity}`,
			  text: `Hey, ${first_name}!\n\nThank you for your generous donation to ${charity}!\n\nMake sure to check back in on ${end_time} to see if you've won!\n\n      Donation Total: $${amount}\n\n\nSincerely,\nCharity Labs Team`
			};
			transporter.sendMail(mailOptions, function(error, info){
			  if (error) {
			    console.log(error);
			  } else {
			    console.log('Email sent: ' + info.response);
			  }
			});

			/*RENDER CONFIRMATION PAGE*/
			context = data;
			context['auction_link'] = req.headers.host+'/auction/'+data['auction_id'];
			context['first_name'] = first_name;
			context['amount'] = amount;
			context['end_time'] = end_time;
			res.render('confirmation', context);
	    }
	});
});

router.get('/', function(req, res, next){
	res.redirect('/');
});



module.exports = router;