var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport')
		;

	var	Schedule 	= require('../../models/ScheduleSchema')
		;

	var actions = {};

	actions.api_index = [
		{
			prefix	: 'api',
			path 	: '/',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {

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

	return actions;
};

module.exports = controller;
