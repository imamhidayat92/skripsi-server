var controller = function() {
	var	_ 			= require('underscore'),
		async		= require('async'),
		passport	= require('passport'),
		mongoose	= require('mongoose'),
		ObjectId	= mongoose.Types.ObjectId
		;

	var	ClassMeeting	= require('../../models/ClassMeetingSchema'),
		Major 			= require('../../models/MajorSchema'),
		Schedule 		= require('../../models/ScheduleSchema'),
		User 			= require('../../models/UserSchema')
		;

	var auth 		= require('../../libs/auth')(),
		utils		= require('../../libs/utils')(),
		API 		= utils.API
		;

	var actions = {};

	/* API Functions */

	actions.api_index = [
		{
			path 	: '/',
			prefix	: 'api',
			method	: 'get',
			before	: auth.check,
			handler	: function(req, res, next) {
				
			}
		},
		{
			path 	: '/',
			prefix	: 'api',
			method	: 'post',
			before	: auth.check,
			handler	: function(req, res, next) {
				var classMeeting = new ClassMeeting();

				_.each(req.body, function(v, k) {
					classMeeting[k] = v;
				});

				classMeeting.lecturer = ObjectId(req.user._id);

				classMeeting.created = new Date();

				classMeeting.save(function(saveError, classMeeting) {
					if (saveError) {
						return API.error.json(res, saveError);
					}
					else {
						return API.success.json(res, classMeeting);
					}
				});
			}
		}
	];

	actions.api_details = [
		{
			path 	: '/:id',
			prefix	: 'api',
			method	: 'get',
			before	: auth.check,
			handler	: function(req, res, next) {
				ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
				.exec(function(findError, classMeeting) {
					if (findError) {
						return API.error.json(res, findError);
					}
					else {
						if (classMeeting == null) {
							return API.invalid.json(res, 'Tidak dapat menemukan data pertemuan kelas.');
						}
						else {
							return API.success.json(res, classMeeting);
						}
					}
				});
			}
		},
		{
			path 	: '/:id',
			prefix	: 'api',
			method	: 'put',
			before	: auth.check,
			handler	: function(req, res, next) {
				ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
				.exec(function(findError, classMeeting) {
					if (findError) {
						return API.error.json(res, findError);
					}
					else {
						_.each(req.body, function(v, k) {
							classMeeting[k] = v;
						})

						classMeeting.save(function(saveError, savedClassMeeting) {
							if (saveError) {
								return API.error.json(res, saveError);
							}
							else {
								return API.success.json(res, savedClassMeeting);
							}
						});
					}
				});
			}
		}
	];

	actions.api_details_attendances = [
		{
			path 	: '/:id/attendances',
			prefix	: 'api',
			method	: 'post',
			before	: auth.check,
			handler	: function(req, res, next) {
				ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
				.exec(function(findError, classMeeting) {
					if (findError) {
						return API.error.json(res, findError);
					}
					else {
						if (classMeeting == null) {
							return API.invalid.json(res, "Tidak dapat menemukan data pertemuan kelas.");
						}
						else {
							_.each(req.body.attendances, function(attendance) {
								classMeeting.attendances.push(ObjectId(attendance));
							});

							classMeeting.save(function(saveError, classMeeting) {
								if (saveError) {
									return API.error.json(res, saveError);
								}
								else {
									return API.success.json(res, classMeeting);
								}
							});
						}
					}
				});
			}
		}
	];

	return actions;
};

module.exports = controller;
