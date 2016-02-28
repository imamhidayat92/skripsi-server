var controller = function(args) {
   var
      _        = require('underscore'),
      async    = require('async'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId,
      passport = require('passport')
      ;

   var
      ClassLocation  = require('../../models/ClassLocationSchema'),
      ClassMeeting   = require('../../models/ClassMeetingSchema'),
      Course         = require('../../models/CourseSchema'),
      Enrollment     = require('../../models/EnrollmentSchema'),
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

   var
      pages = args.pages
      ;

   var actions = {};

   /* Pages */

   actions.index = {
      path     : '/',
      method   : 'get',
      before   : auth.check,
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
         path     : '/add',
         method   : 'get',
         before   : auth.check,
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
         path     : '/add',
         method   : 'post',
         before   : auth.check,
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

   actions.detail_enrollments = [
      {
         path     : '/:id/enrollments',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            Schedule.findOne({ _id: ObjectId(req.params.id) })
            .populate('course')
            .exec(function(findError, schedule) {
               if (findError) {

               }
               else {
                  if (!schedule) {

                  }
                  else {
                     var conditions = {
                        schedule: ObjectId(req.params.id)
                     };

                     Enrollment.find(conditions)
                     .populate('course')
                     .populate('schedule')
                     .populate('student')
                     .populate('lecturer')
                     .exec(function(findError, enrollments) {
                        if (findError) {
                           console.log(findError);
                           res.status(500).render('../../../views/errors/5xx');
                        }
                        else {
                           var options = [
                              { path: 'student.major', model: 'Major' }
                           ];
                           Enrollment.populate(enrollments, options, function(populateError, enrollments) {
                              if (populateError) {
                                 console.log(populateError);
                                 res.status(500).render('../../../views/errors/5xx');
                              }
                              else {
                                 return res.status(200).render('detail_enrollments', {
                                    title: 'Enrollments',
                                    enrollments: enrollments
                                 });
                              }
                           });
                        }
                     });
                  }
               }
            });
         }
      }
   ];

   actions.edit = [
      {
         path     : '/:id/edit',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            Schedule.findOne({ _id: ObjectId(req.params.id) })
            .populate('location')
            .exec(function(findError, schedule) {
               if (findError) {
                  return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
               }
               else {
                  if (!schedule) {
                     return res.status(400).render(pages.INVALID);
                  }
                  else {
                     async.parallel(
                        [
                           function(callback) {
                              var conditions = {};
                              User.find(conditions).exec(callback)
                           },
                           function(callback) {
                              ClassLocation.find(callback);
                           }
                        ],
                        function(asyncError, results) {
                           if (asyncError) {
                              return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
                           }
                           else {
                              var lecturers = results[0];
                              var locations = results[1];

                              return res.status(200).render('edit', {
                                 title: 'Edit Schedule',
                                 locations: locations,
                                 schedule: schedule,
                                 lecturers: lecturers
                              });
                           }
                        }
                     )
                  }
               }
            });
         }
      },
      {
         path     : '/:id/edit',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            Schedule.findOne({ _id: ObjectId(req.params.id) })
            .exec(function(findError, schedule) {
               Object.keys(req.body).forEach(function(field) {
                  switch (field) {
                     case 'day_code':
                     case 'start_time':
                     case 'end_time':
                        schedule[field] = req.body[field];
                        break;
                     case 'location':
                        schedule[field] = ObjectId(req.body[field]);
                        break;
                     default:
                        break;
                  }
               });

               schedule.save(function(saveError, schedule) {
                  if (saveError) {
                     return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
                  }
                  else {
                     return res.redirect('/schedules');
                  }
               });
            });
         }
      }
   ];

   /* API Actions */

   actions.api_index = [
      {
         prefix   : 'api',
         path     : '/',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            Schedule.find()
            .exec(function(findError, schedules) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  return API.success.json(res, schedules);
               }
            });
         }
      },
      {
         prefix   : 'api',
         path     : '/',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            if (req.user.role != 'student') {
               var schedule = new Schedule();

               _.each(req.body, function(v, k) {
                  schedule[k] = v;
               });

               schedule.save(function(saveError, schedule) {
                  if (saveError) {
                     return API.error.json(res, saveError);
                  }
                  else {
                     User.findOne({'_id': ObjectId(req.body.lecturer)})
                     .exec(function(findError, user) {

                     });

                     return API.success.json(res, schedule);
                  }
               });
            }
            else {
               return API.forbidden.json(res, 'Anda tidak diizinkan untuk mengakses sumber daya ini.');
            }
         }
      }
   ];

   actions.api_index_today = [
      {
         prefix   : 'api',
         path     : '/today',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            var conditions = {
               'day_code': new Date().getDay(),
               'lecturer': ObjectId(req.user._id)
            };

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
                        var schedulesFunction = [];

                        schedules.forEach(function(schedule) {
                           schedulesFunction.push(function(callback) {
                              ClassMeeting.find({ schedule: ObjectId(schedule._id) })
                              .sort({created: -1})
                              .exec(callback);
                           });
                        });

                        async.parallel(
                           schedulesFunction,
                           function(asyncError, results) {
                              if (asyncError) {
                                 return API.error.json(res, asyncError);
                              }
                              else {
                                 var scheduleObjects = [], count = 0;
                                 schedules.forEach(function(schedule) {
                                    var scheduleWithExtras = schedule.toObject();
                                    var classMeetings = [];
                                    results[count].forEach(function(classMeeting) {
                                       classMeetings.push(classMeeting.toObject());
                                    });
                                    scheduleWithExtras['___extras'] = {
                                       class_meetings: classMeetings
                                    };
                                    scheduleObjects.push(scheduleWithExtras);
                                    count++;
                                 });

                                 return API.success.json(res, scheduleObjects);
                              }
                           }
                        );
                     }
                  });
               }
            });
         }
      }
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
            .exec(function(findError, schedule) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  return API.success.json(res, schedule.toObject());
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
            var query = Schedule.findOne({'_id': ObjectId(req.params.id)});

            if (typeof req.query._useCache != 'undefined' && req.query.useCache) {
               query.populate('class_meetings');
            }

            query.exec(function(findError, schedule) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  if (!schedule) {
                     return API.invalid.json(res, 'Tidak dapat menemukan data jadwal ini.');
                  }
                  else {
                     if (typeof req.query._useCache != 'undefined' && req.query.useCache) {
                        return API.success.json(res, schedule.class_meetings);
                     }
                     else {
                        ClassMeeting.find({'schedule': ObjectId(req.params.id)})
                        .exec(function(findError, classMeetings) {
                           if (findError) {
                              return API.error.json(res, findError);
                           }
                           else {
                              return API.success.json(res, classMeetings);
                           }
                        });
                     }
                  }
               }
            });
         }
      },
      {
         prefix   : 'api',
         path     : '/:id/class_meetings',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            /* We need to check, whether the ClassMeeting data has already been created before. */
            var existConditions = {
               'schedule': ObjectId(req.params.id),
               'created': new Date().toISOString()
            };

            ClassMeeting.find(existConditions)
            .exec(function(findError, existingClassMeetings) {
               if (findError) {
                  Logger.printError(findError);
                  return API.error.json(res, findError);
               }
               else {
                  if (existingClassMeetings.length > 0) {
                     /* Assume that the first encountered data is the previously entered data. */
                     return API.invalid.json(res, 'Data kelas pertemuan telah dibuat sebelumnya.');
                  }
                  else {
                     var classMeeting = new ClassMeeting();

                     _.each(req.body, function(v, k) {
                        classMeeting[k] = v;
                     });

                     // Always set it to not verified.
                     classMeeting.verified = false;

                     classMeeting.course = ObjectId(req.body.course);
                     classMeeting.lecturer = req.user._id;
                     classMeeting.schedule = ObjectId(req.body.schedule);

                     classMeeting.created = new Date();
                     classMeeting.modified = new Date();

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
      },
      {
         prefix   : 'api',
         path     : '/:id/class_meetings',
         method   : 'put',
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
