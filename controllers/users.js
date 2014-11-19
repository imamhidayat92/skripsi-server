var express 	= require('express'),
	passport	= require('passport'),
	router		= express.Router(),
	apiRouter 	= express.Router(),

	User 		= require('../models/UserSchema')
	;

apiRouter.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
	
});

apiRouter.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {

});

apiRouter.get('/authenticate', function(req, res) {
	var conditions = {};

	if (typeof req.body.email != "undefined" && typeof req.body.password != "undefined") {
		conditions.email = req.body.email;
		conditions.password = req.body.password;
	}
	else if (typeof req.body.identifier != "undefined") {
		conditions.identifier = req.body.identifier;
	}
	else {
		res.status(400).json({
			message: "Invalid request."
		});
	}

	User.findOne(conditions).exec(function(err, user) {
		if (err) {
			res.status(500).json({
				message: "Something bad happened."
			});
		}

		if (user) {
			res.status(200).json({
				message: "Hello " + user.name + "!",
				result: user
			});
		}
		else {
			res.status(403).json({
				message: "Invalid credentials."
			});
		}
	});
});

apiRouter.get('/identify', passport.authenticate('bearer', { session: false }), function(req, res) {
	var conditions = {};

	if (typeof req.body.identifier != "undefined") {
		conditions.identifier = req.body.identifier;
	}
	else {
		res.status(400).json({
			message: "Invalid request."
		});
	}

	User.findOne(conditions).exec(function(err, user) {
		if (err) {
			res.status(500).json({
				message: "Something bad happened."
			});
		}

		if (user) {
			res.status(200).json({
				message: "Hello " + user.name + "!",
				result: user
			});
		}
		else {
			res.status(403).json({
				message: "Invalid credentials."
			});
		}
	});
});

apiRouter.get('/:user_id', passport.authenticate('bearer', { session: false }), function(req, res) {
	
});

apiRouter.patch('/:user_id', passport.authenticate('bearer', { session: false }), function(req, res) {
	
});

apiRouter.get('/:user_id/schedules', passport.authenticate('bearer', { session: false }), function(req, res) {
	
});

router.api = apiRouter;

module.exports = router;
