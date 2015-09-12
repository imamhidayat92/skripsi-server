var controller = function(args) {
   var auth = args.auth;

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

            if (typeof req.query.all != 'undefined' && req.query.all) {

            }

            TeachingReport.find()

            async.parallel(
               [
                  function(callback) {

                  },
                  function(callback) {

                  }
               ],
               function(results) {

               }
            );
         }
      },
      {
         path     : '/',
         prefix   : 'api',
         method   : 'post',
         before   : auth.check,
         handler  : function(req, res, next) {
            return API.success.json(res, { message: 'Unimplemented' });
         }
      }
   ];

   return actions;
};

module.exports = controller;
