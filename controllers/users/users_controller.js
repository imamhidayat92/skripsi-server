var controller = function(args) {
   var
      _        = require('underscore'),
      async    = require('async'),
      passport = require('passport'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId
      ;

   var
      Enrollment  = require('../../models/EnrollmentSchema'),
      Major       = require('../../models/MajorSchema'),
      Schedule    = require('../../models/ScheduleSchema'),
      User     = require('../../models/UserSchema')
      ;

   var
      auth       = args.auth,
      passport    = args.passport,
      pages       = args.pages,
      utils    = args.utils,
      API      = utils.API
      ;

   var actions = {};

   /* Pages */

   actions.add = [
      {
         path  : '/add',
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
         path  : '/add',
         method   : 'post',
         handler  : function(req, res, next) {
            var user = new User();

            _.each(req.body, function(v, k) {
               user[k] = v;
            });

            user.provider = 'local';

            user.save(function(saveError, savedUser) {
               if (saveError) {
                  console.log(saveError);
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
         return res.render('dashboard', {
            title: 'Dashboard'
         });
      }
   };

   actions.detail_enrollments = [
      {
         path     : '/:id/enrollments',
         method   : 'get',
         handler  : function(req, res, next) {

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

   actions.index = [
      {
         path     : '/',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            User.find()
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
         path  : '/login',
         method   : 'get',
         handler  : function(req, res, next) {
                if (req.isAuthenticated()) {
               return res.redirect('/users/dashboard');
            }
            else {
               return res.status(200).render('login', {
                  title: 'Login',
                  flashMessages: utils.getFlashMessages(req, res, next)
               });
            }
         }
      },
      {
         path     : '/login',
         method   : 'post',
         handler  : function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
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
            var findParams = req.body;

            var conditions = {};
            var $andConditions = [];
            var $orConditions = [];

            if ($andConditions.length > 0) {
               conditions['$and'] = $andConditions;
            }

            if ($orConditions.length > 0) {
               conditions['$or'] = $orConditions;
            }

            User.find(conditions).exec(function(findError, users) {
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
         path     : '/',
         prefix   : 'api',
         method   : 'post',
         before   : passport.authenticate('bearer', { session: false }),
         handler  : function(req, res, next) {

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
         path  : '/:id',
         prefix   : 'api',
         method   : 'put',
         before   : passport.authenticate('bearer', { session: false }),
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

   actions.api_user_enrollments = [
      {
         path     : '/:id/enrollments',
         prefix   : 'api',
         method   : 'get',
         before   : passport.authenticate('bearer', { session: false }),
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
         before   : passport.authenticate('bearer', { session: false }),
         handler  : function(req, res, next) {

         }
      }
   ];

   actions.api_user_schedules = [
      {
         path     : '/:id/schedules',
         prefix   : 'api',
         method   : 'get',
         before   : passport.authenticate('bearer', { session: false }),
         handler  : function(req, res, next) {
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
         path     : '/:id/schedules',
         prefix   : 'api',
         method   : 'post',
         before   : passport.authenticate('bearer', { session: false }),
         handler  : function(req, res, next) {

         }
      }
   ];

   return actions;
}

module.exports = controller;
