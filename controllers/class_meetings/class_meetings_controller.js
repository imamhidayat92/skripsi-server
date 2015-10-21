var controller = function(args) {
   var
      _        = require('underscore'),
      async    = require('async'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId
      ;

   var
      Attendance     = require('../../models/AttendanceSchema'),
      ClassMeeting   = require('../../models/ClassMeetingSchema'),
      Enrollment     = require('../../models/EnrollmentSchema'),
      Major          = require('../../models/MajorSchema'),
      Schedule       = require('../../models/ScheduleSchema'),
      TeachingReport = require('../../models/TeachingReportSchema'),
      User           = require('../../models/UserSchema')
      ;

   var
      auth     = require('../../libs/auth')(),
      config   = require('../../config'),
      utils    = require('../../libs/utils')(),
      API      = utils.API,
      Logger   = utils.Logger,
      pages    = args.pages
      ;

   var actions = {};

   actions.index = {
      path     : '/',
      method   : 'get',
      before   : auth.check,
      handler  : function(req, res, next) {
         ClassMeeting.find()
         .populate('course')
         .populate('lecturer')
         .populate('report')
         .populate('schedule')
         .exec(function(error, classMeetings) {
            if (error) {
               return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
            }
            else {
               return res.status(200).render('index', {
                  classMeetings: classMeetings,
                  title: 'Index of Class Meeting'
               });
            }
         });
      }
   };

   actions.detail_attendances = {
      path     : '/:id/attendances',
      method   : 'get',
      before   : auth.check,
      handler  : function(req, res, next) {
         ClassMeeting.findOne({ _id: ObjectId(req.params.id) })
         .populate('course')
         .populate('lecturer')
         .populate('report')
         .populate('schedule')
         .exec(function(findError, classMeeting) {
            if (findError) {
               return res.status(500).render(pages.FORBIDDEN);
            }
            else {
               if (!classMeeting) {
                  return res.status(404).render(pages.NOT_FOUND);
               }
               else {
                  Attendance.find({ class_meeting: classMeeting._id })
                  .populate('class_meeting')
                  .populate('schedule')
                  .populate('student')
                  .exec(function(findError, attendances) {
                     if (findError) {
                        return res.status(500).render(pages.FORBIDDEN);
                     }
                     else {
                        return res.status(200).render('detail_attendances', {
                           attendances: attendances,
                           classMeeting: classMeeting,
                           title: 'Class Meeting Detail'
                        });
                     }
                  });
               }
            }
         });
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
               if (k == 'created') {
                  andConditions.push({
                     '$gt': {

                     }
                  });
               }
            }

            var criterias = {
               'created': 'desc'
            };

            if (typeof req.query._all != 'undefined' && req.query._all) {
               if (req.user.role != 'administrator' && req.user.role != 'staff') {
                  return API.forbidden(res, 'Parameter tidak diizinkan untuk diakses ');
               }
            }

            if (andConditions.length > 0) {
               conditions['$and'] = andConditions;
            }

            if (orConditions.length > 0) {
               conditions['$or'] = orConditions;
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
            // The question is, how? -_-

            var now = new Date();

            var existConditions = {
               'course': ObjectId(req.body.course),
               'schedule': ObjectId(req.body.schedule),
               'lecturer': req.user._id
            };

            ClassMeeting.find(existConditions)
            .exec(function(findError, existingClassMeetings) {
               if (findError) {
                  Logger.printError(findError);
                  return API.error.json(res, findError);
               }
               else {
                  if (existingClassMeetings.length > 0) {
                     return API.invalid.json(res, 'Data kelas pertemuan telah dibuat sebelumnya.');
                  }
                  else {
                     if (typeof req.body.type == 'undefined') {
                        return API.invalid.json(res, 'Tipe kelas harus ditentukan.');
                     }
                     else {
                        // TODO: Need to check minimum requirements for class meeting type.

                        switch (req.body.type) {
                           case 'general':
                           case 'mid-test':
                           case 'final-test':
                           default:
                              break;
                        }

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
                              return API.success.json(res, classMeeting.toObject());
                           }
                        });
                     }
                  }
               }
            });
         }
      }
   ];

   actions.api_count = {
      path     : '/',
      prefix   : 'api',
      method   : 'get',
      before   : auth.check,
      handler  : function(req, res, next) {
         var conditions = {};
         ClassMeeting.count(conditions, function() {

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
            ClassMeeting.findOne({"_id": ObjectId(req.params.id)})
            .populate('course')
            .populate('lecturer')
            .populate('report')
            .populate('schedule')
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
                     return API.success.json(res, classMeeting.toObject());
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
                     console.log(req.body);
                     console.log(classMeeting);
                     _.each(req.body, function(v, k) {
                        console.log(v, k);
                        // This conditions will trigger new Attendance data creation for related class meeting.
                        if (k == 'verified' && !classMeeting.verified) {
                           // Update every enrolled user status.
                           Attendance.find({ class_meeting: ObjectId(req.params.id) })
                           .exec(function(findError, attendances) {
                              if (findError) {
                                 Logger.printError(findError);
                              }
                              else {
                                 var presentStudents = [];
                                 attendances.forEach(function(attendance) {
                                    if (attendance.status === 'present') {
                                       presentStudents.push(attendance.student);
                                    }
                                 });
                                 Enrollment.find({ schedule: classMeeting.schedule })
                                 .exec(function(findError, enrollments) {
                                    if (findError) {
                                       Logger.printError(findError);
                                    }
                                    else {
                                       enrollments.forEach(function(enrollment) {
                                          console.log('Checking Enrollment Data', enrollment);
                                          presentStudents.forEach(function(presentStudentId) {
                                             if (presentStudentId.toString() !== enrollment.student.toString()) {
                                                var attendance = new Attendance();

                                                attendance.status = 'unknown';

                                                attendance.class_meeting = classMeeting._id;
                                                attendance.schedule = classMeeting.schedule;
                                                attendance.student = enrollment.student;

                                                attendance.save(function(saveError, attendance) {
                                                   if (saveError) {
                                                      Logger.printError(saveError);
                                                   }
                                                   else {
                                                      Logger.printMessage('New attendance data saved.')
                                                   }
                                                });
                                             }
                                          });
                                       });
                                    }
                                 });
                              }
                           });
                        }
                        classMeeting[k] = v;
                     });

                     classMeeting.modified = new Date();

                     classMeeting.save(function(saveError, savedClassMeeting) {
                        var returnedObject = savedClassMeeting.toObject();
                        if (saveError) {
                           return API.error.json(res, saveError);
                        }
                        else {
                           return API.success.json(res, returnedObject);
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
         path     : '/:id/attendances',
         prefix   : 'api',
         method   : 'get',
         before   : auth.check,
         handler  : function(req, res, next) {
            ClassMeeting.findOne({'_id': ObjectId(req.params.id)})
            .exec(function(findError, classMeeting) {
               if (findError) {
                  Logger.printError(findError);
                  return API.error.json(res, findError);
               }
               else {
                  if (classMeeting == null) {
                     return API.invalid.json(res, 'Tidak dapat menemukan data pertemuan yang dimaksud.');
                  }
                  else {
                     var conditions = {
                        class_meeting: ObjectId(req.params.id)
                     };
                     Attendance.find(conditions)
                     .populate('class_meeting')
                     .populate('schedule')
                     .populate('student')
                     .exec(function(findError, attendances) {
                        if (findError) {
                           Logger.printError(findError);
                           return API.error.json(res, findError);
                        }
                        else {
                           var results = [];
                           attendances.forEach(function(attendance) {
                              var attendanceObject = attendance.toObject();
                              results.push(attendanceObject);
                           });
                           return API.success.json(res, results);
                        }
                     });
                  }
               }
            });
         }
      },
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
            ClassMeeting.findOne({ '_id': ObjectId(req.params.id) })
            .populate('course')
            .populate('schedule')
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
                     var mode = null;
                     var conditions = {};
                     if (typeof req.body.identifier != 'undefined') {
                        conditions.identifier = req.body.identifier;
                        mode = 'identifier';
                     }
                     else if (typeof req.body.id_number != 'undefined') {
                        conditions.id_number = req.body.id_number;
                        mode = 'id_number';
                     }
                     else {
                        return API.invalid.json(res, "Data untuk identifikasi tidak ditemukan.");
                     }
                     User.findOne(conditions)
                     .exec(function(error, user) {
                        if (findError) {
                           Logger.printError(findError);
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
                                 Enrollment.find({ student: user._id, schedule: classMeeting.schedule })
                                 .exec(function(findError, enrollments) {
                                    if (findError) {
                                       return API.error.json(res, findError);
                                    }
                                    else {
                                       if (enrollments.length == 0) {
                                          return API.invalid.json(res, 'Mahasiswa ini tidak terdaftar di kuliah ini.');
                                       }
                                       else {
                                          var existConditions = {
                                             class_meeting: classMeeting._id,
                                             student: user._id
                                          };
                                          Attendance.find(existConditions)
                                          .exec(function(findError, attendances) {
                                             if (findError) {
                                                Logger.printError(findError);
                                                return API.error.json(res, findError);
                                             }
                                             else {
                                                if (attendances.length > 0) {
                                                   return API.invalid.json(res, 'Data kehadiran pernah ditambahkan sebelumnya.');
                                                }
                                                else {
                                                   /* Compose attendance data. */
                                                   var attendance = new Attendance();

                                                   attendance.mode = mode;
                                                   attendance.status = 'present';
                                                   attendance.remarks = '';
                                                   attendance.verified = true;

                                                   attendance.class_meeting = classMeeting._id;
                                                   attendance.course = classMeeting.course._id;
                                                   attendance.schedule = classMeeting.schedule._id;
                                                   attendance.student = user._id;

                                                   attendance.created = new Date();
                                                   attendance.modified = new Date();

                                                   attendance.save(function(saveError, attendance) {
                                                      if (saveError) {
                                                         Logger.printError(saveError);
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

                                                         var returnedObject = attendance.toObject();

                                                         returnedObject.course = classMeeting.course;
                                                         returnedObject.schedule = classMeeting.schedule;
                                                         returnedObject.student = user;

                                                         return API.success.json(res, returnedObject);
                                                      }
                                                   });
                                                }
                                             }
                                          });
                                       }
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
                     report.course = classMeeting.course;
                     report.lecturer = classMeeting.lecturer;

                     report.created = new Date();

                     report.save(function(saveError, report) {
                        if (saveError) {
                           Logger.printError(saveError);
                           return API.error.json(res, saveError);
                        }
                        else {
                           classMeeting.teaching_report = report._id;

                           classMeeting.save(function(saveError, classMeeting) {
                              if (saveError) {
                                 Logger.printError(saveError);
                              }
                           });

                           // Update Cache
                           Attendance.find({'class_meeting': classMeeting._id})
                           .exec(function(findError, attendances) {
                              if (findError) {

                              }
                              else {

                              }
                           });

                           var rawReportObject = report.toObject();

                           return API.success.json(res, rawReportObject);
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
