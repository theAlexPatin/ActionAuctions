var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

router.post('/', function(req, res){
	console.log('here');
	console.log(req.body);
	var auction_id = req.body.auction_id;
	console.log(auction_id);
	res.redirect('/auction/'+auction_id);
});

module.exports = router;
