var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport')
		;

	var	User 	= require('../../models/UserSchema');
		;

	var actions = {};

	var name = 'users';

	/* API */

	actions.api_index = [
		{
			path 	: '/',
			prefix	: 'api',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				User.find().exec(function(findError, users) {
					if (findError) {
						return res.status(500).json({
							success: false,
							message: "",
							system_error: {
								message: "",
								error: findError
							}
						});
					}
					else {
						return res.status(200).json({
							success: true,
							message: "",
							results: users
						});
					}
				});
			}
		},
		{
			path 	: '/',
			prefix	: 'api',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				
			}
		}
	];

	actions.api_authenticate = {
		path 	: '/authenticate',
		prefix	: 'api',
		method	: 'get',
		handler	: function(req, res, next) {
			var conditions = {};

			if (typeof req.body.email != "undefined" && typeof req.body.password != "undefined") {
				conditions.email = req.body.email;
				conditions.password = req.body.password;
			}
			else if (typeof req.body.identifier != "undefined") {
				conditions.identifier = req.body.identifier;
			}
			else {
				return res.status(400).json({
					message: "Invalid request."
				});
			}

			User.findOne(conditions).exec(function(err, user) {
				if (err) {
					return res.status(500).json({
						message: "Something bad happened."
					});
				}

				if (user) {
					return res.status(200).json({
						message: "Hello " + user.name + "!",
						result: user
					});
				}
				else {
					return res.status(403).json({
						message: "Invalid credentials."
					});
				}
			});
		}
	};

	actions.api_identify = {
		path 	: '/identify',
		prefix	: 'api',
		method	: 'get',
		before	: passport.authenticate('bearer', { session: false }),
		handler	: function(req, res, next) {
			var conditions = {};

			if (typeof req.body.identifier != "undefined") {
				conditions.identifier = req.body.identifier;

				User.findOne(conditions).exec(function(err, user) {
					if (err) {
						return res.status(500).json({
							message: "Something bad happened."
						});
					}
					else {
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
					}				
				});
			}
			else {
				res.status(400).json({
					message: "Invalid request."
				});
			}			
		}
	};

	actions.api_details = [
		{
			path 	: '/:user_id',
			prefix	: 'api',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				User.findOne({
					'_id': mongoose.Types.ObjectId(req.param.user_id)
				})
				.exec(function(err, user) {
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
						res.status(400).json({
							message: "Invalid user id supplied."
						});
					}
				});
			}
		},
		{
			path 	: '/:user_id',
			prefix	: 'api',
			method	: 'patch',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

			}
		},
	];

	actions.api_user_enrollments = [
		{
			path 	: '/:user_id/enrollments',
			prefix	: 'api',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

			}
		},
		{
			path 	: '/:user_id/enrollments',
			prefix	: 'api',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				
			}
		}
	];

	actions.api_user_schedules = [
		{
			path 	: '/:user_id/schedules',
			prefix	: 'api',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

			}
		},
		{
			path 	: '/:user_id/schedules',
			prefix	: 'api',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				
			}
		}
	];

	return actions;
} 

module.exports = controller;
