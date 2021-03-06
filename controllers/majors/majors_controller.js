var controller = function(args) {
   var _    = require('underscore')
      ;

   var
      Major = require('../../models/MajorSchema')
      ;

   var
      utils      = require('../../libs/utils'),
      API      = utils.API
      ;

   var actions = {};

   /* Pages */

   actions.add = [
      {
         path  : '/add',
         method   : 'get',
         handler  : function(req, res, next) {
            res.render('add', {
               title: 'Add New Major'
            });
         }
      },
      {
         path  : '/add',
         method   : 'post',
         handler  : function(req, res, next) {
            var user = new User();

            _.each(req.body, function(v, k) {
               user[k] = v;
            });

            user.provider = 'local';

            user.save(function(saveError, savedUser) {
               if (saveError) {
                  console.log(saveError);
                  return res.status(500).render('../../../views/errors/5xx');
               }
               else {
                  res.redirect('/users/add');
               }
            });
         }
      }
   ];

   /* API Functions */

   actions.api_index = [
      {
         path  : '/',
         prefix   : 'api',
         method   : 'get',
         handler  : function(req, res, next) {
            Major.find().exec(function(findError, majors) {
               if (findError) {
                  return res.status(500).json({
                     success: false,
                     message: "",
                     system_error: {
                        message: "",
                        error: findError
                     }
                  });
               }
               else {
                  return res.status(200).json({
                     success: true,
                     message: "",
                     results: majors
                  });
               }
            });
         }
      },
      {
         path  : '/',
         prefix   : 'api',
         method   : 'post',
         handler  : function(req, res, next) {
            var major = new Major();

            _.map(req.body, function(v, k) {
               major[k] = v;
            });

            major.save(function(saveError, savedMajor) {
               if (saveError) {
                  return res.status(500).json({
                     success: false,
                     message: "",
                     system_error: {
                        message: "",
                        error: saveError
                     }
                  });
               }
               else {
                  res.status(200).json({
                     success: true,
                     message: "",
                     result: savedMajor
                  });
               }
            });
         }
      }
   ];

   return actions;
};

module.exports = controller;
