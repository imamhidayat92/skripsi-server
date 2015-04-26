var controller = function(args) {
	var	_ 			= require('underscore'),
		async 		= require('async'),
		mongoose	= require('mongoose'),
		ObjectId	= mongoose.Types.ObjectId,
		passport	= require('passport')
		;

	var	Course 		= require('../../models/CourseSchema'),
		Major 		= require('../../models/MajorSchema')
		;

	var utils		= require('../../libs/utils'),
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
							title: 'Tambah Mata Kuliah Baru',
							majors: results[0]
						})
					}
				);
			}
		},
		{
			path 	: '/add',
			method	: 'post',
			handler	: function(req, res, next) {
				var course = new Course();

				if (req.body.major.length == 0) {
					delete req.body.major;
				}

				_.each(req.body, function(v, k) {
					course[k] = v;
				});

				course.created = new Date();

				course.save(function(saveError, course) {
					if (saveError) {
						console.log(saveError);
					}
					else {
						res.redirect('/courses/' + course._id);
					}
				});
			}
		}
	];

	actions.detail = {
		path 	: '/:id',
		method	: 'get',
		handler	: function(req, res, next) {
			Course.findOne({"_id": ObjectId(req.params.id)})
			.populate('major')
			.exec(function(findError, course) {
				if (findError) {
					res.status(500).render('../../../views/errors/5xx');
				}
				else {
					if (course == null) {
						res.status(404).render('../../../views/errors/404');
					}
					else {
						res.render('detail', {
							title: course.name,
							course: course
						});
					}
				}
			});
		}
	};

	actions.edit = [
		{
			path 	: '/:id/edit',
			method	: 'get',
			handler	: function(req, res, next) {
				Course.findOne({"_id": ObjectId(req.params.id)})
				.populate('major')
				.exec(function(findError, course) {
					if (findError) {
						res.status(500).render('../../../views/errors/5xx');
					}
					else {
						if (course == null) {
							res.status(404).render('../../../views/errors/404');
						}
						else {
							res.render('edit', {
								title: 'Ubah: ' + course.name,
								course: course
							});
						}
					}
				});
			}
		},
		{
			path 	: '/:id/edit',
			method	: 'post',
			handler	: function(req, res, next) {
				Course.findOne({"_id": ObjectId(req.params.id)})
				.populate('major')
				.exec(function(findError, course) {
					if (findError) {
						res.status(500).render('../../../views/errors/5xx');
					}
					else {
						if (course == null) {
							res.status(404).render('../../../views/errors/404');
						}
						else {
							res.render('detail', {
								title: course.name,
								course: course
							});
						}
					}
				});
			}
		}
	];

	/* API Functions */

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
