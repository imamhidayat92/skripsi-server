var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport')
		;

	var	Course 		= require('../../models/CourseSchema')
		;

	var utils		= require('../../libs/utils'),
		API 		= utils.API
		;

	var actions = {};

	actions.api_index = [
		{
			prefix	: 'api',
			path 	: '/',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				Course.find()
				.exec(function(findError, courses) {
					if (findError) {
						return API.error.json(res, findError);
					}
					else {
						return API.success.json(res, courses);
					}
				});
			}
		},
		{
			prefix	: 'api',
			path 	: '/',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				var course = new Course();

				_.map(req.body, function(v, k) {
					course[k] = v;
				});

				course.save(function(saveError, savedCourse) {
					if (saveError) {
						return API.error.json(res, saveError);
					}
					else {
						return API.success.json(res, savedCourse);
					}
				});
			}
		},
	];

	actions.api_detail = [
		{
			prefix	: 'api',
			path 	: '/:id',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				
			}
		},
		{
			prefix	: 'api',
			path 	: '/:id',
			method	: 'patch',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				
			}
		},
	];

	return actions;
};

module.exports = controller;
