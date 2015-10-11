var controller = function(args) {
   var
      async = require('async');

   var
      Attendance  = require('../../models/AttendanceSchema');

   var
      auth        = args.auth,
      passport    = args.passport,
      pages       = args.pages,
      utils       = args.utils,
      API         = utils.API
      ;

   var actions = {};

   /* Pages */

   actions.index = {
      path     : '/',
      method   : 'get',
      before   : auth.check,
      handler  : function(req, res, next) {
         return res.status(200).render('index', {
            title: 'Daftar User',
            users: []
         });
      }
   };

   /* API Actions */

   actions.api_index = {
      method  : 'get',
      prefix  : 'api',
      path    : '/',
      before  : auth.check,
      handler : function(req, res, next) {
         var conditions = {
            $and: []
         };

         for (var i in req.body) {
            if (req.body.hasOwnProperty(i)) {
               
            }
         }

         var orConditions = [];

         if (orConditions.length > 0) {
            conditions.$or = orConditions;
         }

         async.parallel(
            [
               function(callback) {
                  Attendance.count(conditions, callback);
               },
               function(callback) {
                  Attendance.find(conditions)
                  .exec(callback)
               }
            ],
            function(asyncError, results) {
               if (asyncError) {
                  return API.error.json(res, asyncError);
               }
               else {
                  var count = results[0];
                  var attendances = results[1];
               }
            }
         );
      }
   };

   actions.api_detail = [
      {
         method  : 'get',
         prefix  : 'api',
         path    : '/:id',
         before  : auth.check,
         handler : function(req, res, next) {
            Attendance.findOne({'_id': ObjectId(req.params.id)})
            .populate('class_meeting')
            .populate('schedule')
            .populate('student')
            .exec(function(findError, attendance) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  return API.success.json(res, attendance);
               }
            });
         }
      },
      {
         method  : 'put',
         prefix  : 'api',
         path    : '/:id',
         before  : auth.check,
         handler : function(req, res, next) {
            Attendance.findOne({'_id': ObjectId(req.params.id)})
            .exec(function(findError, attendance) {
               if (findError) {
                  return API.error.json(res, findError);
               }
               else {
                  if (!attendance) {
                     return API.invalid.json(res, attendance);
                  }
                  else {
                     _.each(req.body, function(v, k) {
                        attendance[k] = v;
                     });

                     attendance.modified = new Date();

                     attendance.save(function(saveError, attendance) {
                        if (saveError) {
                           return API.error.json(res, saveError);
                        }
                        else {
                           return API.success.json(res, attendance);
                        }
                     });
                  }
               }
            });
         }
      },
      {
         method  : 'delete',
         prefix  : 'api',
         path    : '/:id',
         before  : auth.check,
         handler : function(req, res, next) {
            Attendance.findOne({'_id': ObjectId(req.params.id)})
            .remove(function(deleteError, attendance) {
               if (deleteError) {
                  return API.error.json(res, deleteError);
               }
               else {
                  if (!attendance) {
                     return API.invalid.json(res, attendance);
                  }
                  else {
                     // TODO: Update cache.

                     return API.success.json(res, attendance);
                  }
               }
            });
         }
      }
   ];

   return actions;
};

module.exports = controller;
