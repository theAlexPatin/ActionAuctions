var modules = require('./app');
var service_email = modules.service_email;
var ddb = modules.ddb;
var email_pass = modules.email_pass;
var nodemailer = require('nodemailer');
var host = modules.base_url;
var schedule = require('node-schedule');
var moment = require('moment-timezone');

var transporter = nodemailer.createTransport({
  host: 'smtp-relay.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: service_email,
    pass: email_pass
  }
});

function sendEmail(subject, text, email){
	var mailOptions = {
		from: "Action Auctions <admin@actionauctions.org>",
		to: email,
		subject: subject,
		text: text
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

module.exports = {
	payout_confirmation: function(first_name, reimbursed_amt, email){
		var subject=`Payment from Charity Labs`;
		var text=`Hey, ${first_name}!\n\nYour payout of $${reimbursed_amt} is currently being processed. Please allow 2-5 business days for the transfer to occur!\n\nSincerely,\nCharity Labs Team`;
		sendEmail(subject, text, email);
	},


	payment_confirmation: function(charity, first_name, end_time, amount, email){
		var subject=`Confirming your Donation to ${charity}`;
		var text = `Hey, ${first_name}!\n\nThank you for your generous donation to ${charity}!\n\nMake sure to check back in on ${end_time} to see if you've won!\n\n      Donation Total: $${amount}\n\n\nSincerely,\nCharity Labs Team`;
		sendEmail(subject, text, email);
	},

	start_job: function(auction_id, ending_time, timezone){
		start_job(auction_id, ending_time, timezone);
	},

	restart_jobs: function(d){
		ddb = d;
		ddb.scan({TableName:"Auctions"},function(err,data){
			if(err)
				console.log('error scanning auctions');
			else{
				for (var i = 0; i < data['Items'].length; i++){
					auction = data['Items'][i];
					if (!auction['has_ended']){
						start_job(auction['auction_id'], auction['ending_time'], auction['timezone']);
					}
				}
			}
		});
	},

	notify_winner: function(auction_id){
		notify_winner(auction_id);
	}, 

	modify_date: function(date, timezone){
		return modify_date(date, timezone);
	}
};

function modify_date(old_date, timezone){
	if(timezone == undefined)
		timezone = "America/New_York";
	var m_auction = moment.tz(old_date, timezone);
	var tz =  m_auction.clone().tz(moment.tz(moment.tz.guess()).zoneAbbr());
	var date = new Date(tz.toISOString());
	return date;
}

function start_job(auction_id, ending_time, timezone){
	var date = modify_date(ending_time, timezone);
	console.log('started job for '+auction_id+ " at "+date);
	var job = schedule.scheduleJob(date,function(argument) {
		var now = new Date();
		if (now >= date){
			console.log("notifying winner for "+auction_id);
			notify_winner(auction_id);
			job.cancel();
		}
	});
}

function notify_winner(auction_id){
	var params = {
		TableName: "Auctions",
		Key:{
			"auction_id":auction_id
		}
	};
	ddb.get(params, function(err, data){
		if (err)
        	console.log("Error fetching auction from database");
	    else{
	    	auction_data = data['Item'];
	    	if ('highest_bidder' in auction_data){
	    		console.log('got auction data');
		    	params = {
		    		TableName: "Bids",
		    		Key:{
		    			"bidder_id":auction_data['highest_bidder']
		    		}
		    	}
		    	ddb.get(params, function(err, data){
		    		if(err){
		    			console.log("Error fetching highest bidder");
		    			params = {
		    				TableName:'Auctions',
		    				Key:{'auction_id':auction_id},
		    				UpdateExpression:'set has_ended=:h',
		    				ExpressionAttributeValues:{':h':true}
		    			}
		    			ddb.update(params, function(){})
		    		} else{
		    			console.log("got bidder data");
		    			bidder_data = data['Item'];
		    			var email  = bidder_data['email'];
		    			var first_name = bidder_data['first_name'];
		    			var amount = parseFloat(new String(Math.floor(auction_data['current_amt'] / 2)/100)).toFixed(2);
				    	var total = parseFloat(new String(Math.floor(auction_data['current_amt'])/100)).toFixed(2);
				    	var charity = auction_data['charity'];
		    			var link = host + '/winner/' + bidder_data['bidder_id'];
		    			console.log(link);
					    var params = {
				    		TableName:"Auctions",
				    		Key:{
				    			"auction_id":auction_id
				    		},
				    		UpdateExpression: "set winner_url=:w, has_ended=:h, reimbursed=:r",
				    		ExpressionAttributeValues: {
						        ":w":bidder_data['bidder_id'],
						        ":r":false,
						        ":h":true
						    },
				  			ReturnValues:"ALL_NEW"
				    	}
					    ddb.update(params, function(err, data) {
						    if (err) {
						        console.error("Unable to update item.", JSON.stringify(err, null, 2));
						    } else {
						    	console.log("updated auction data");
				    			var subject=`Congrats! You've won Auction "${auction_id}"`;
								var text = `Congratulations, ${first_name}!\n\nYou made the largest donation. All donations totaled to $${total}, so you've won $${amount}.\n\nBut wait!\n\nYou can still choose to donate your earnings and feel great about yourself!\n\nFollow the link below to redeem your earnings or donate them to ${charity}\n\n${link}\n\nSincreley,\nCharity Labs Team`;
								sendEmail(subject, text, email);
						    }
						});
			    			
		    		}
		    	});
	    	}
	    }
	});
}