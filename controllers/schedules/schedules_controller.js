var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport'),
		mongoose	= require('mongoose'),
		ObjectId	= mongoose.Types.ObjectId
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

	actions.api_detail = [

	];

	actions.api_detail_majors = [

	];

	actions.api_detail_students = [
		{
			prefix	: 'api',
			path 	: '/:schedule_id/students',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				Schedule.select('students')
				.populate('students')
				.exec(function(findError, schedule) {
					if (findError) {

					}
					else {
						return res.status(200).json({
							success: true,
							message: "",
							results: schedule.students
						});
					}
				});
			}
		},
		{
			prefix	: 'api',
			path 	: '/:schedule_id/students',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				Schedule.findOne({"_id": ObjectId()})
				.exec(function(findError, schedule) {
					schedule.students.push(ObjectId(req.body._id));
					schedule.save(function(saveError, savedSchedule) {
						if (saveError) {
							res.status(500).json({
								success: false,
								message: ""
							});
						}
						else {
							res.status(200).json({

							});
						}
					});
				});
			}
		}
	];

	return actions;
};

module.exports = controller;
