var controller = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport'),
		mongoose	= require('mongoose'),
		ObjectId	= mongoose.Types.ObjectId
		;

	var	Schedule 	= require('../../models/ScheduleSchema')
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
				Schedule.find({
					"day_code": new Date().getDay(),
					"lecturer": ObjectId(req.user._id)
				})
				.populate('majors')
				.exec(function(findError, schedules) {
					if (findError) {
						return API.error(res, findError);
					}	
					else {
						return API.success(res, schedules);
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
				if (req.user.role == 'lecturer') {
					var schedule = new Schedule();

					_.each(req.body, function(v, k) {
						schedule[k] = v;
					});

					schedule.save(function(saveError, schedule) {
						if (saveError) {
							return API.error(res, saveError);
						}
						else {
							return API.success(res, schedule);
						}
					});
				}
				else {
					return API.forbidden(res, "Anda tidak diizinkan untuk mengakses aksi ini.");
				}
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
				Schedule.find({
					"_id": ObjectId(req.params.id)
				})
				.populate('majors')
				.populate('students')
				.exec(function(findError, schedules) {
					if (findError) {
						return API.error(res, findError);
					}
					else {
						return API.success(res, schedules);
					}
				});
			}
		}
	];

	actions.api_detail_majors = [
		
	];

	actions.api_detail_students = [
		{
			prefix	: 'api',
			path 	: '/:id/students',
			method	: 'get',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				Schedule.select('students')
				.populate('students')
				.exec(function(findError, schedule) {
					if (findError) {
						return API.error(res, findError);
					}
					else {
						return API.success(res, schedule.students);
					}
				});
			}
		},
		{
			prefix	: 'api',
			path 	: '/:id/students',
			method	: 'post',
			before	: passport.authenticate('bearer', { session: false }),
			handler	: function(req, res, next) {
				Schedule.findOne({"_id": ObjectId()})
				.exec(function(findError, schedule) {
					schedule.students.push(ObjectId(req.body._id));
					schedule.save(function(saveError, savedSchedule) {
						if (saveError) {
							return API.error(res, saveError);
						}
						else {
							API.success(res, savedSchedule);
						}
					});
				});
			}
		}
	];

	return actions;
};

module.exports = controller;
