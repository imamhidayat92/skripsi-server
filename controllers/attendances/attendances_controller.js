var controller = function(args) {
   var async = require('async');

   var actions = {};

   actions.index = {
      method  : 'get',
      path    : '',
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

   actions.detail = [
      {
         method  : 'get',
         path    : '/:id',
         before  : auth.check
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
         method  : 'update',
         path    : '/:id',
         before  : auth.check
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
