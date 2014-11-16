var express = require('express'),
	router	= express.Router()
	;

router.path = '/';

router.get('/', function(req, res) {
	res.render('site/index', {
		title: 'Home'
	});
});

module.exports = router;
