var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/:auction_id', function(req, res, next) {
	console.log(req.params);
	res.render('auction', {auction_id: req.params.auction_id});
});

module.exports = router;
