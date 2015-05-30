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
    
   return actions;
};

module.exports = controller;
