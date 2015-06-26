var controller = function(args) {
   var
      _        = require('underscore'),
      async       = require('async'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId,
      passport = require('passport')
      ;

   var
      ClassLocation  = require('../../models/ClassLocationSchema'),
      ClassMeeting   = require('../../models/ClassMeetingSchema'),
      Course         = require('../../models/CourseSchema'),
      Major          = require('../../models/MajorSchema'),
      Schedule       = require('../../models/ScheduleSchema'),
      User           = require('../../models/UserSchema')
      ;

   var
      auth    = require('../../libs/auth')(),
      utils    = require('../../libs/utils')(),
      API      = utils.API,
      Logger   = utils.Logger
      ;

   var actions = {};

   /* Pages */

   actions.index = {
      path  : '/',
      method   : 'get',
      handler  : function(req, res, next) {
         Schedule.find()
         .populate('course')
         .populate('lecturer')
         .sort({'day_code': 'asc'})
         .exec(function(findError, schedules) {
            var populates = [
               {path: 'course.major', model: 'Major'}
            ];
            Schedule.populate(schedules, populates, function(populateError, schedules) {
               res.render('index', {
                  title: 'Jadwal Kuliah',
                  schedules: schedules
               });
            });
         });
      }
   }

   actions.add = [
      {
         path  : '/add',
         method   : 'get',
         handler  : function(req, res, next) {
            async.parallel(
               [
                  function(callback) {
                     ClassLocation.find().exec(callback);
                  },
                  function(callback) {
                     Course.find().exec(callback);
                  },
                  function(callback) {
                     User.find({"role": "lecturer"}).exec(callback);
                  }
               ],
               function(asyncError, results) {
                  res.render('add', {
                     title: 'Tambah Jadwal Baru',
                     locations: results[0],
                     courses: results[1],
                     users: results[2]
                  });
               }
            );
         }
      },
      {
         path  : '/add',
         method   : 'post',
         handler  : function(req, res, next) {
            var schedule = new Schedule();

            _.each(req.body, function(v, k) {
               schedule[k] = v;
            });

            schedule.created = new Date();

            schedule.save(function(saveError, schedule) {
               if (saveError) {
                  console.log(saveError);
                  res.status(500).render('../../../views/errors/5xx');
               }
               else {
                  res.redirect('/schedules/add');
               }
            });
         }
      }
   ];

   /* API Functions */

   actions.api_index = [
      {
         prefix   : 'api',
         path  : '/',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            Schedule.find({
               "day_code": new Date().getDay(),
               "lecturer": ObjectId(req.user._id)
            })
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
                        return API.success.json(res, schedules);
                     }
                  })
               }
            });
         }
      },
      {
         prefix   : 'api',
         path  : '/',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            if (req.user.role == 'lecturer') {
               var schedule = new Schedule();

               _.each(req.body, function(v, k) {
                  schedule[k] = v;
               });

               schedule.save(function(saveError, schedule) {
                  if (saveError) {
                     return API.error.json(res, saveError);
                  }
                  else {
                     return API.success.json(res, schedule);
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
         prefix   : 'api',
         path     : '/:id',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            Schedule.findOne({
               "_id": ObjectId(req.params.id)
            })
            .populate('course')
            .populate('lecturer')
            .populate('location')
            .populate('enrollments')
            .populate('meetings')
            .exec(function(findError, schedules) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  return API.success.json(res, schedules);
               }
            });
         }
      }
   ];

   actions.api_detail_class_meetings = [
      {
         prefix   : 'api',
         path     : '/:id/class_meetings',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            if (typeof req.query._useCache != 'undefined' && req.query.useCache) {

            }
            else {

            }
         }
      },
      {
         prefix   : 'api',
         path     : '/:id/class_meetings',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            var classMeeting = new ClassMeeting();

            _.each(req.body, function(v, k) {
               classMeeting[k] = v;
            });

            classMeeting.save(function(saveError, classMeeting) {
               if (saveError) {
                  return API.error.json(res, saveError);
               }
               else {
                  Schedule.findOne({'_id': ObjectId(req.params.id)})
                  .exec(function(findError, schedule) {
                     if (findError) {

                     }
                     else {
                        /* Update Cache */
                        schedule.class_meetings.push(classMeeting._id);

                        schedule.save(function(saveError, schedule) {
                           if (saveError) {
                              Logger.printError(saveError);
                           }
                           else {
                              Logger.printMessage('Cache update for schedule.id == ' + schedule._id);
                           }
                        });
                     }
                  });

                  return API.success.json(res, classMeeting);
               }
            });
         }
      },
      {
         prefix   : 'api',
         path     : '/:id/class_meetings',
         method   : 'update',
         before   : auth.check,
         handler  : function(req, res, next) {
            ClassMeeting.findOne({'_id': ObjectId(req.params.id)})
            .exec(function(findError, classMeeting) {
               if (findError) {
                  return API.error.json(res, saveError);
               }
               else {
                  if (!classMeeting) {
                     return API.invalid.json(res, 'Tidak dapat menemukan data jadwal yang dimaksud');
                  }
                  else {
                     var excludedFields = ['_id', 'attendances'];
                     for (var i = 0; i < excludedFields; i++) {
                        delete req.body[excludedFields[i]];
                     }

                     _.each(req.body, function(v, k) {
                        classMeeting[k] = v;
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

   actions.api_detail_majors = [

   ];

   actions.api_detail_students = [
      {
         prefix   : 'api',
         path     : '/:id/students',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
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
         prefix   : 'api',
         path  : '/:id/students',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
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
