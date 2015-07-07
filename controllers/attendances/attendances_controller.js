var controller = function(args) {
   var async = require('async');

   var actions = {};

   var
      auth     = require('../../libs/auth')(),
      utils    = require('../../libs/utils')(),
      API      = utils.API,
      Logger   = utils.Logger
      ;

   /* API Actions */

   actions.api_index = {
      method  : 'get',
      prefix  : 'api',
      path    : '',
      before  : auth.check,
      handler : function(req, res, next) {
         var conditions = {
            $and: []
         };

         for (var i in req.body) {

         }

         var orConditions = [];

         if (orConditions.length > 0) {

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
                  return API.error(res, 'Gagal mengambil data kehadiran.');
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
      }
   ];

   return actions;
};

module.exports = controller;
