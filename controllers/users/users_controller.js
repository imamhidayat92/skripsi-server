var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport'),
		mongoose	= require('mongoose'),
		ObjectId	= mongoose.Types.ObjectId
		;

	var	Schedule 	= require('../../models/ScheduleSchema'),
		User 		= require('../../models/UserSchema')
		;

	var actions = {};

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
								message: "Halo " + user.name + "!",
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
					success: false,
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
					'_id': ObjectId(req.param.user_id)
				})
				.exec(function(findError, user) {
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
				delete req.body._id;

				User.findByIdAndUpdate(ObjectId(req.params.user_id, {$set: req.body}, {}, function(updateError, savedUser) {
					if (updateError) {
						return res.status(500).json({
							success: false,
							message: "",
							system_error: {
								message: "",
								error: updateError
							}
						});
					}
					else {
						return res.status(200).json({
							success: true,
							message: "",
							results: savedUser
						});
					}
				}));
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
				User.findOne({"_id": ObjectId(req.params.user_id)})
				.populate('enrollments')
				.exec(function(findError, user) {
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
						res.status(200).json({
							success: true,
							message: "",
							results: user.enrollments
						});
					}
				});
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
				User.findOne({"_id": ObjectId(req.params.user_id)})
				.populate('schedules')
				.exec(function(findError, user) {
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
						res.status(200).json({
							success: true,
							message: "",
							results: user.schedules
						});
					}
				});
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
