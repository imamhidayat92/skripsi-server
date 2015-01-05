var controller = function() {
	var	_ 			= require('underscore'),
		async		= require('async'),
		passport	= require('passport'),
		mongoose	= require('mongoose'),
		ObjectId	= mongoose.Types.ObjectId
		;

	var	Major 		= require('../../models/MajorSchema'),
		Schedule 	= require('../../models/ScheduleSchema'),
		User 		= require('../../models/UserSchema')
		;

	var auth 		= require('../../libs/auth')(),
		utils		= require('../../libs/utils')(),
		API 		= utils.API
		;

	var actions = {};

	/* Pages */

	actions.add = [
		{
			path 	: '/add',
			method	: 'get',
			handler	: function(req, res, next) {
				async.parallel(
					[
						function(callback) {
							Major.find().exec(callback);
						}
					], 
					function(asyncError, results) {
						res.render('add', {
							title: 'Add New User',
							majors: results[0]
						});
					}
				);
			}
		},
		{
			path 	: '/add',
			method	: 'post',
			// before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				var user = new User();

				_.each(req.body, function(v, k) {
					user[k] = v;
				});

				user.provider = 'local';

				user.save(function(saveError, savedUser) {
					if (saveError) {
						console.log(saveError);
						return res.status(500).render('../../../views/errors/5xx');
					}
					else {
						res.redirect('/users/add');
					}
				});
			}
		}
	];

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
		method	: 'post',
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
					return API.error.json(res, err);
				}
				else {
					if (user) {
						return API.success.json(res, user);
					}
					else {
						return API.forbidden.json(res);
					}
				}
			});
		}
	};

	actions.api_current = {
		path 	: '/current',
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

	actions.api_identity = {
		path 	: '/identity',
		prefix	: 'api',
		method	: 'post',
		before	: auth.check,
		handler	: function(req, res, next) {
			User.findOne({"identifier": ObjectId(req.body.identifier)})
			.exec(function(findError, user) {
				if (findError) {
					return API.error(res, findError);
				}
				else {
					if (user == null) {
						return API.invalid.json(res, 'User tidak ditemukan.');
					}
					else {
						return API.success.json(res, user);
					}
				}
			});
		}
	};

	actions.api_details = [
		{
			path 	: '/:id',
			prefix	: 'api',
			method	: 'get',
			before	: auth.check,
			handler	: function(req, res, next) {
				User.findOne({
					'_id': ObjectId(req.param.id)
				})
				.exec(function(findError, user) {
					if (findError) {
						return API.error.json(res, findError);
					}

					if (user == null) {
						return API.invalid.json(res, 'Tidak dapat menemukan user dengan id yang diberikan.');
					}
					else {
						return API.success.json(res, user, 'Halo ' + user.display_name);
					}
				});
			}
		},
		{
			path 	: '/:id',
			prefix	: 'api',
			method	: 'patch',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				delete req.body._id;

				User.findByIdAndUpdate(ObjectId(req.params.id, {$set: req.body}, {}, function(updateError, savedUser) {
					if (updateError) {
						return API.error.json(res, updateError)
					}
					else {
						return API.success.json(res, savedUser);
					}
				}));
			}
		},
	];

	actions.api_user_enrollments = [
		{
			path 	: '/:id/enrollments',
			prefix	: 'api',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				User.findOne({"_id": ObjectId(req.params.id)})
				.populate('enrollments')
				.exec(function(findError, user) {
					if (findError) {
						return API.error.json(res, findError);
					}
					else {
						return API.success.json(res, user.enrollments);
					}
				});
			}
		},
		{
			path 	: '/:id/enrollments',
			prefix	: 'api',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				
			}
		}
	];

	actions.api_user_schedules = [
		{
			path 	: '/:id/schedules',
			prefix	: 'api',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				User.findOne({"_id": ObjectId(req.params.id)})
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
			path 	: '/:id/schedules',
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
