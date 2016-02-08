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
      API         = utils.API,
      APIHelper   = utils.APIHelper
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
         var conditions = {};

         var $orConditions = [];
         var $andConditions = [];

         Object.keys(req.query).forEach(function(key) {
            var condition = {};
            switch (key) {
               case 'mode':
               case 'status':
                  condition[key] = req.query[key];
                  $andConditions.push(condition);
                  break;
               case 'remarks':
                  condition[key] = new RegExp(req.query[key]);
                  $andConditions.push(condition);
                  break;
               case 'verified':
                  condition[key] = req.query[key] === 'true';
                  $andConditions.push(condition);
                  break;
               case 'class_meeting':
               case 'schedule':
               case 'student':
                  condition[key] = ObjectId(req.query[key]);
                  $andConditions.push(condition);
                  break;
               case '_since':
                  condition[key] = {
                     $lt: req.query[key]
                  };
                  $andConditions.push(condition);
               default:
                  break;
            }
         });

         if ($orConditions.length > 0) {
            conditions['$or'] = $orConditions;
         }

         if ($andConditions.length > 0) {
            conditions['$and'] = $andConditions;
         }

         var query = Attendance
            .find(conditions)
            .populate('class_meeting', 'schedule', 'student');

         if (req.query['_limit'] && typeof req.query['_limit'] === 'number') {
            req.limit(req.query['_limit']);
         }

         query.exec(function(findError, attendances) {
            if (findError) {
               return API.error.json(res, findError);
            }
            else {
               return API.success.json(
                  res, attendances, 'Sukses.', APIHelper.composeContinuousAdditionalData(users, req.query, req.originalUrl)
               );
            }
         });

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
