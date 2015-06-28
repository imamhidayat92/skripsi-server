var controller = function(args) {
   var
      _        = require('underscore'),
      async    = require('async'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId
      ;

   var
      ClassMeeting   = require('../../models/ClassMeetingSchema'),
      Major          = require('../../models/MajorSchema'),
      Schedule       = require('../../models/ScheduleSchema'),
      User           = require('../../models/UserSchema')
      ;

   var
      auth     = require('../../libs/auth')(),
      config   = require('../../config'),
      utils    = require('../../libs/utils')(),
      API      = utils.API,
      Logger   = utils.Logger
      ;

   var actions = {};

   /* API Actions */

   actions.api_index = [
      {
         path     : '/',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            var conditions = {};
            var andConditions = [];
            var orConditions = [];

            for (var k in req.query) {
               if (!req.query.hasOwnProperty(k)) { continue; }
               if (k == 'verified') {
                  andConditions.push({
                     'verified': req.query[k]
                  });
               }
               if (k == 'course' || k == 'report' || k == 'schedule' || k == 'user') {
                  var condition = {};
                  condition[k] = ObjectId(req.query[k]);
                  andConditions.push(condition);
               }

            }

            var criterias = {
               'created': 'desc'
            };



            if (typeof req.query._all != 'undefined' && req.query._all) {

            }

            var query = ClassMeeting.find(conditions);

            async.parallel(
               [
                  function(callback) {
                     query.exec(callback);
                  },
                  function(callback) {
                     query.count(callback);
                  }
               ],
               function(asyncError, results) {
                  if (asyncError) {
                     return API.error.json(res, asyncError);
                  }
                  else {
                     var classMeetings = results[0];
                     var classMeetingCount = results[1];
                     return API.success.json();
                  }
               }
            );
         }
      },
      {
         /*
            This is one of the main entry point for "Record Attendance Data" function.
            spec: {
               lecturer: '',
               course: '',
               schedule: ''
            }
         }
         */
         path     : '/',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            /* We need to check, whether the ClassMeeting data has already been created before. */
            var existConditions = {
               'schedule': ObjectId(req.body.schedule),
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
                     classMeeting.lecturer = ObjectId(req.body.lecturer);
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
      }
   ];

   actions.api_details = [
      {
         path     : '/:id',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
            .exec(function(findError, classMeeting) {
               if (findError) {
                  Logger.printError(findError);
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
         path     : '/:id',
         prefix   : 'api',
         method   : 'put',
         before   : auth.check,
         handler  : function(req, res, next) {
            ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
            .exec(function(findError, classMeeting) {
               if (findError) {
                  Logger.printError(findError);
                  return API.error.json(res, findError);
               }
               else {
                  if (!classMeeting) {
                     return API.invalid.json(res, 'Tidak dapat menemukan data pertemuan kelas yang dimaksud.');
                  }
                  else {
                     _.each(req.body, function(v, k) {
                        classMeeting[k] = v;
                     });

                     classMeeting.modified = new Date();

                     classMeeting.save(function(saveError, savedClassMeeting) {
                        if (saveError) {
                           return API.error.json(res, saveError);
                        }
                        else {
                           return API.success.json(res, savedClassMeeting);
                        }
                     });
                  }
               }
            });
         }
      }
   ];

   actions.api_details_attendances = [
      {
         /* This is the main entry point of the "Record Attendance Data" function. */
         /*
            spec: {
               identifier: String,
            }
         */
         path     : '/:id/attendances',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
            .exec(function(findError, classMeeting) {
               if (findError) {
                  Logger.printError(findError);
                  return API.error.json(res, findError);
               }
               else {
                  if (classMeeting == null) {
                     return API.invalid.json(res, "Tidak dapat menemukan data pertemuan kelas.");
                  }
                  else {
                     User.findOne({"identifier": ObjectId(req.params.identifier)})
                     .exec(function(error, user) {
                        if (findError) {
                           return API.error.json(res, findError);
                        }
                        else {
                           if (!user) {
                              return API.invalid.json(res, "Tidak dapat menemukan data mahasiswa yang dimaksud.");
                           }
                           else {
                              if (user.role != 'student') {
                                 return API.invalid.json(res, "Tidak dapat menyimpan data selain data mahasiswa.");
                              }
                              else {
                                 /* Compose attendance data. */
                                 var attendance = new Attendance();

                                 attendance.class_meeting = classMeeting._id;
                                 attendance.course = '';
                                 attendance.schedule = classMeeting.schedule;
                                 attendance.student = user._id;

                                 attendance.created = new Date();
                                 attendance.modified = new Date();

                                 attendance.save(function(saveError, attendance) {
                                    if (saveError) {
                                       return API.error.json(res, saveError)
                                    }
                                    else {
                                       /* Update Cache */
                                       classMeeting.attendances.push(attendance._id);
                                       classMeeting.save(function(saveError, classMeeting) {
                                          if (saveError) {
                                             Logger.printError(saveError);
                                          }
                                          else {
                                             Logger.printMessage('New attendance data inserted successfully.');
                                          }
                                       });

                                       return API.success.json(res, user);
                                    }
                                 });
                              }
                           }
                        }
                     });
                  }
               }
            });
         }
      }
   ];

   actions.api_details_teaching_reports = [
      /*
         This is main entry point for "Add New Teaching Report" function.
         spec = {

         }
      */
      {
         path     : '/:id/teaching_reports',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            ClassMeeting.findOne({'_id': ObjectId(req.params.id)})
            .exec(function(findError, classMeeting) {
               if (findError) {
                  Logger.printError(findError);
                  return API.error.json(res, findError);
               }
               else {
                  if (classMeeting.report) {
                     return API.invalid.json(err, 'Laporan mengajar telah dibuat sebelumnya.');
                  }
                  else {
                     var report = new TeachingReport();

                     _.each(req.body, function(v, k) {
                        report[k] = v;
                     });

                     report.class_meeting = classMeeting._id;

                     report.created = new Date();

                     report.save(function(saveError, report) {
                        if (saveError) {
                           Logger.printError(saveError);
                           return API.error.json(res, saveError);
                        }
                        else {
                           classMeeting.teaching_report = report._id;

                           classMeeting.save(function(saveError, classMeeting) {

                           });

                           return API.success.json(res, report);
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
