var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport')
		;

	var	Course 		= require('../../models/CourseSchema')
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
					
				});
			}
		},
		{
			prefix	: 'api',
			path 	: '/',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

			}
		},
	];

	actions.api_detail = [
		{
			prefix	: 'api',
			path 	: '/:course_id',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

			}
		},
		{
			prefix	: 'api',
			path 	: '/:course_id',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

			}
		},
	];

	return actions;
};

module.exports = controller;
