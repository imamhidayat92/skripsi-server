var controller = function(args) {
   var
      _        = require('underscore'),
      async    = require('async'),
      passport = require('passport'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId
      ;

   var
      Enrollment     = require('../../models/EnrollmentSchema'),
      Major          = require('../../models/MajorSchema'),
      Schedule       = require('../../models/ScheduleSchema'),
      TeachingReport = require('../../models/TeachingReportSchema'),
      User           = require('../../models/UserSchema')
      ;

   var
      auth        = args.auth,
      passport    = args.passport,
      pages       = args.pages,
      utils       = args.utils,
      API         = utils.API,
      APIHelper   = utils.APIHelper,
      ViewHelper  = utils.ViewHelper
      ;

   var actions = {};

   /* Pages */

   actions.add = [
      {
         path     : '/add',
         method   : 'get',
         handler  : function(req, res, next) {
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
         path     : '/add',
         method   : 'post',
         handler  : function(req, res, next) {
            var user = new User();

            _.each(req.body, function(v, k) {
               user[k] = v;
            });

            user.provider = 'local';
            user.created = new Date();

            user.save(function(saveError, savedUser) {
               if (saveError) {
                  return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
               }
               else {
                  res.redirect('/users/add');
               }
            });
         }
      }
   ];

   actions.dashboard = {
      path     : '/dashboard',
      method   : 'get',
      before   : auth.check,
      handler  : function(req, res, next) {
         Schedule.find({day_code: new Date().getDay()})
         .populate('course')
         .populate('lecturer')
         .exec(function(findError, schedules) {
            if (findError) {
               return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
            }
            else {
               return res.render('dashboard', {
                  title: 'Dashboard',
                  schedules: schedules
               });
            }
         })
      }
   };

   actions.detail_attendances = [
      {
         path     : '/:id/attendances',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            User.findOne({ _id: ObjectId(req.params.id) })
            .exec(function(findError, user) {
               if (findError) {
                  return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
               }
               else {
                  if (!user) {
                     return res.status(400).render(pages.INVALID);
                  }
                  else {
                     return res.render('detail_attendances_index', {
                        title: user.name + ' Attendances'
                     });
                  }
               }
            })
         }
      }
   ];

   actions.detail_enrollments = [
      {
         path     : '/:id/enrollments',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            async.parallel(
               [
                  function(callback) {
                     User.findOne({'_id': ObjectId(req.params.id)})
                     .populate('major')
                     .exec(callback);
                  },
                  function(callback) {
                     Enrollment.find({'student': ObjectId(req.params.id)})
                     .populate('course')
                     .populate('schedule')
                     .populate('lecturer')
                     .exec(callback);
                  }
               ],
               function(asyncError, results) {
                  if (asyncError) {
                     return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
                  }
                  else {
                     return res.render('detail_enrollments_index', {
                        title: 'Enrollments',
                        enrollments: results[1],
                        user: results[0]
                     });
                  }
               }
            );
         }
      },
      {
         path  : '/:id/enrollments/add',
         method   : 'get',
         handler  : function(req, res, next) {
            async.parallel(
               [
                  function(callback) {
                     Enrollment.find({"student": ObjectId(req.params.id)})
                     .exec(function(findError, enrollments) {
                        if (findError) {
                           console.log(findError);
                           callback(findError, null);
                        }
                        else {
                           var alreadyEnrolled = [];
                           _.each(enrollments, function(enrollment) {
                              alreadyEnrolled.push(enrollment.schedule);
                           });

                           Schedule.find({
                              "_id": {
                                 $nin: alreadyEnrolled
                              }
                           })
                           .populate('course')
                           .populate('lecturer')
                           .exec(callback);
                        }
                     });
                  },
                  function(callback) {
                     User.findOne({"_id": ObjectId(req.params.id)})
                     .populate('major')
                     .exec(callback);
                  }
               ],
               function(asyncError, results) {
                  if (asyncError) {
                     console.log(asyncError);
                     res.status(500).render(pages.INTERNAL_SERVER_ERROR);
                  }
                  else {
                     res.render('detail_enrollments_add', {
                        title: 'Pendaftaran Mata Kuliah',
                        schedules: results[0],
                        student: results[1]
                     });
                  }
               }
            );
         }
      },
      {
         path     : '/:id/enrollments/add',
         method   : 'post',
         handler  : function(req, res, next) {
            Schedule.findOne({"_id": ObjectId(req.body.schedule)})
            .exec(function(findError, schedule) {
               if (findError) {
                  console.log(findError);
                  res.status(500).render(pages.INTERNAL_SERVER_ERROR);
               }
               else {
                  if (schedule == null) {
                     res.status(404).render(pages.NOT_FOUND);
                  }
                  else {
                     var enrollment = new Enrollment();

                     enrollment.schedule = schedule._id;
                     enrollment.course = schedule.course;
                     enrollment.student = ObjectId(req.params.id);
                     enrollment.lecturer = schedule.lecturer;

                     enrollment.created = new Date();

                     enrollment.save(function(saveError) {
                        if (saveError) {
                           console.log(saveError);
                           res.status(500).render(pages.INTERNAL_SERVER_ERROR);
                        }
                        else {
                           schedule.enrollments.push(enrollment);
                           schedule.save();

                           User.findByIdAndUpdate(ObjectId(req.params.id), {"enrollments": {$push: enrollment}}).exec();

                           res.redirect('/users/' + req.params.id + '/enrollments/add');
                        }
                     });
                  }
               }
            });
         }
      }
   ];

   actions.detail_schedules = [
      {
         path     : '/:id/schedules',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            User.findOne({ _id: ObjectId(req.params.id) })
            .exec(function(findError, user) {
               if (findError) {
                  return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
               }
               else {
                  if (!user) {
                     return res.status(404).render(pages.NOT_FOUND);
                  }
                  else {
                     if (req.user.role != 'lecturer') {
                        return res.status(400).render(pages.INVALID)
                     }
                     else {
                        Schedule.find({ lecturer: ObjectId(req.params.id) })
                        .exec(function(findError, schedule) {
                           if (findError) {
                              return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
                           }
                           else {

                           }
                        });
                     }
                  }
               }
            });
         }
      }
   ];

   actions.index = [
      {
         path     : '/',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            User.find()
            .populate('major')
            .exec(function(findError, users) {
               if (findError) {
                  // TODO: Render internal server error view.
               }
               else {
                  return res.status(200).render('index', {
                     title: 'Daftar User',
                     users: users
                  });
               }
            });
         }
      }
   ];

   actions.login = [
      {
         path     : '/login',
         method   : 'get',
         handler  : function(req, res, next) {
                if (req.isAuthenticated()) {
               return res.redirect('/users/dashboard');
            }
            else {
               return res.status(200).render('login', {
                  title: 'Login',
                  flashMessages: ViewHelper.getFlashMessages(req, res, next)
               });
            }
         }
      },
      {
         path     : '/login',
         method   : 'post',
         handler  : function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
               console.log(user);
               if (err) {
                  console.log(err);
                  next(err);
               }
               else {
                  if (!user) {
                     req.flash('danger', 'Wrong username or password.');
                     return res.redirect('/users/login');
                  }
                  else {
                     req.login(user, function(logInError) {
                        if (logInError) {
                           console.log(logInError);
                           req.flash('danger', 'Login failed.');
                           next(logInError);
                        }
                        else {
                           return res.redirect('/users/dashboard');
                        }
                     });

                  }
               }
            })(req, res, next);
         }
      }
    ];

   actions.logout = {
      path     : '/logout',
      method   : 'get',
      handler  : function(req, res, next) {
         req.logout();
         return res.redirect('/');
      }
   };

   /* API Actions */

   actions.api_index = [
      {
         path     : '/',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            var findParams = req.query;

            var conditions = {};
            var $andConditions = [];
            var $orConditions = [];

            Object.keys(findParams).forEach(function(field) {
               switch (field) {
                  case 'address':
                  case 'display_name':
                  case 'email':
                  case 'name':
                     var condition = {};
                     condition[field] = new RegExp('/' + findParams[field] + '/g');
                     $andConditions.push(condition);
                     break;
                  case 'major':
                     $andConditions.push({
                        'major': ObjectId(findParams[field])
                     });
                     break;
                  default:
                     break;
               }
            });

            if ($orConditions.length > 0) {
               conditions['$or'] = $orConditions;
            }

            if (req.query['_since']) {
               $andConditions.push({
                  created: {
                     '$lt': new Date(req.query.since)
                  }
               });
            }

            var query = User.find(conditions);

            // query.limit(5);
            query.populate('major');

            if (req.query.populates) {
               req.query.populates.forEach(function(field) {
                  query.populate(field);
               });
            }

            query.exec(function(findError, users) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  return API.success.json(
                     res, users, 'Sukses.', APIHelper.composeContinuousAdditionalData(users, req.query, req.originalUrl)
                  );
               }
            });
         }
      },
      {
         path     : '/',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            var user = new User();

            _.each(req.body, function(v, k) {
               user[k] = v;
            });

            user.created = new Date();

            user.save(function(saveError, user) {
               if (saveError) {
                  return API.error.json(res, saveError);
               }
               else {
                  return API.success.json(res, user);
               }
            });
         }
      }
   ];

   actions.api_authentication = {
      path     : '/authentication',
      prefix   : 'api',
      method   : 'post',
      handler  : function(req, res, next) {
         var conditions = {};

         if (typeof req.body.email != "undefined" && typeof req.body.password != "undefined") {
            conditions.email = req.body.email;
         }
         else if (typeof req.body.identifier != "undefined") {
            conditions.identifier = req.body.identifier;
         }
         else {
            return res.status(400).json({
               message: "Permintaan data tidak valid."
            });
         }

         User.findOne(conditions).exec(function(err, user) {
            if (err) {
               return API.error.json(res, err, "Terjadi kesalahan di dalam sistem.");
            }
            else {
               if (user == null) {
                  return API.forbidden.json(res, "Autentikasi gagal dilakukan.");
               }
               else {
                  if (user.role != 'lecturer') {
                     return API.forbidden.json(res, "Mahasiswa/Staf tidak diizinkan untuk mengakses sumber daya.")
                  }
                  else {
                     if (typeof req.body.identifier != "undefined") {
                        // Login via tag, accept.
                        return API.success.json(res, user);
                     }
                     else {
                        if (user.hashed_password == user.encryptPassword(req.body.password)) {
                           return API.success.json(res, user);
                        }
                        else {
                           return API.forbidden.json(res, "E-mail/password yang Anda masukkan tidak valid.")
                        }
                     }
                  }
               }
            }
         });
      }
   };

   actions.api_current = {
      path     : '/current',
      prefix   : 'api',
      method   : 'get',
      before   : auth.check,
      handler  : function(req, res, next) {
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
      path     : '/identity',
      prefix   : 'api',
      method   : 'post',
      before   : auth.check,
      handler  : function(req, res, next) {
         User.findOne({"identifier": req.body.identifier})
         .populate('major')
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
         path     : '/:id',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            User.findOne({
               '_id': ObjectId(req.params.id)
            })
            .populate('major')
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
         path     : '/:id',
         prefix   : 'api',
         method   : 'put',
         before   : auth.check,
         handler  : function(req, res, next) {
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

   actions.api_user_attendances = [
      {
         path     : '/:id/attendances',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            var conditions = {};

            var andConditions = [];

            Object.keys(req.query).forEach(function(key) {
               var obj = {};
               switch(key) {
                  case 'mode':
                  case 'status':
                  case 'remarks':
                     obj[key] = req.query[key];
                     andConditions.push(obj);
                  case 'verified':
                     obj[key] = req.query[key] === 'true';
                     andConditions.push(obj);
                  default:
                     break;
               }
            });

            if (andConditions.length > 0) {
               conditions['$and'] = andConditions;
            }

            conditions['student'] = ObjectId(req.params.id);

            Attendance.find(conditions)
            .populate('class_meeting')
            .populate('schedule')
            .populate('student')
            .exec(function(findError, attendances) {
               return API.success.json(res, attendances);
            });
         }
      }
   ];

   actions.api_user_enrollments = [
      {
         path     : '/:id/enrollments',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
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
         path     : '/:id/enrollments',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {

         }
      }
   ];

   actions.api_user_schedules = [
      {
         path     : '/:id/schedules',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            var conditions = {
               'lecturer': ObjectId(req.user._id)
            };

            for (var k in req.query) {
               if (k == 'day_code') {
                  conditions.day_code = req.query.day_code;
               }
            }

            if (typeof req.query._useCache != 'undefined' && req.query._useCache) {
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
                     var results = [];

                     res.status(200).json({
                        success: true,
                        message: "",
                        results: user.schedules
                     });
                  }
               });
            }
            else {
               if (typeof req.params._all != 'undefined' && req.params._all) {
                  conditions = {};
               }

               Schedule.find(conditions)
               .populate('course')
               .populate('location')
               .exec(function(findError, schedules) {
                  if (findError) {
                     return API.error.json(res, findError);
                  }
                  else {
                     var populates = [
                        {path: 'course.major', model: 'Major'}
                     ];

                     Schedule.populate(schedules, populates, function(populateError, schedules) {
                        if (populateError) {
                           return API.error.json(res, populateError);
                        }
                        else {
                           var schedulesObject = [];
                           schedules.forEach(function(schedule) {
                              schedulesObject.push(schedule.toObject());
                           });
                           return API.success.json(res, schedulesObject);
                        }
                     });
                  }
               });
            }
         }
      },
      {
         path     : '/:id/schedules',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {

         }
      }
   ];

   actions.api_user_teaching_reports = [
      {
         path     : '/:id/teaching_reports',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            var conditions = {
               lecturer: req.user._id
            }

            TeachingReport.find(conditions)
            .populate('class_meeting')
            .populate('course')
            .populate('lecturer')
            .exec(function(findError, teachingReports) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  var results = [];
                  teachingReports.forEach(function(report) {
                     results.push(report.toObject());
                  });

                  return API.success.json(res, results);
               }
            });
         }
      }
   ];

   return actions;
};

module.exports = controller;
