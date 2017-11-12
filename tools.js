var modules = require('./app');
var service_email = modules.service_email;
var ddb = modules.ddb;
var email_pass = modules.email_pass;
var nodemailer = require('nodemailer');
var host = modules.base_url;

var transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: service_email,
    pass: email_pass
  }
});

function sendEmail(subject, text, email){
	var mailOptions = {
		from: service_email,
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
	
	email_confirmation: function(charity, first_name, end_time, amount, email){
		var subject=`Confirming your Donation to ${charity}`;
		var text = `Hey, ${first_name}!\n\nThank you for your generous donation to ${charity}!\n\nMake sure to check back in on ${end_time} to see if you've won!\n\n      Donation Total: $${amount}\n\n\nSincerely,\nCharity Labs Team`;
		sendEmail(subject, text, email);
	},

	notify_winner: function(auction_id){
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
				  			ReturnValues:"UPDATED_NEW"
				    	}
					    ddb.update(params, function(err, data) {
						    if (err) {
						        console.error("Unable to update item.", JSON.stringify(err, null, 2));
						    } else {
						    	console.log("updated auction data");
				    			var subject=`Congrats! You've won auction ${auction_id}`;
								var text = `Congratulations, ${first_name}!\n\nYou made the largest donation. All donations totaled to $${total}, so you've won $${amount}.\n\nBut wait!\n\nYou can still choose to donate your earnings and feel great about yourself!\n\nFollow the link below to redeem your earnings or donate them to ${charity}\n\n${link}\n\nSincreley,\nCharity Labs Team`;
								sendEmail(subject, text, email);
						    }
						});
			    			
		    		}
		    	});
		    }
		});
	}
};