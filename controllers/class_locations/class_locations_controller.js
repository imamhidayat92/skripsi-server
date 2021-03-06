var controller = function(args) {
   var
      _        = require('underscore'),
      async    = require('async'),
      passport = require('passport'),
      mongoose = require('mongoose'),
      ObjectId = mongoose.Types.ObjectId
      ;

   var
      ClassLocation  = require('../../models/ClassLocationSchema'),
      Major          = require('../../models/MajorSchema'),
      Schedule       = require('../../models/ScheduleSchema'),
      User           = require('../../models/UserSchema')
      ;

   var
      auth        = require('../../libs/auth')(),
      utils       = require('../../libs/utils')(),
      API         = utils.API
      ;

   var
      pages       = args.pages;

   var actions = {};

   actions.index = {
      path     : '/',
      method   : 'get',
      handler  : function(req, res, next) {
         ClassLocation.find()
         .exec(function(findError, classLocations) {
            if (findError) {
               return res.status(500).render(pages.INTERNAL_SERVER_ERROR);
            }
            else {
               return res.status(200).render('index', {
                  title : 'Class Locations',
                  classLocations: classLocations
               });
            }
         });
      }
   };

   actions.add = [
      {
         path  : '/add',
         method   : 'get',
         handler  : function(req, res) {
            res.render('add', {
               title: 'Tambah Lokasi Baru'
            });
         }
      },
      {
         path  : '/add',
         method   : 'post',
         handler  : function(req, res) {
            var location = new ClassLocation();

            _.each(req.body, function(v, k) {
               location[k] = v;
            });

            location.created = new Date();

            location.save(function(saveError, location) {
               if (saveError) {
                  res.render('../../../views/errors/5xx');
               }
               else {
                  res.redirect('/class_locations/add');
               }
            });
         }
      }
   ];

   /* API Functions */

   actions.api_index = {
      path     : '/',
      prefix   : 'api',
      method   : 'get',
      handler  : function(req, res, next) {
         ClassLocation.find()
         .exec(function(findError, classLocations) {
            if (findError) {
               return API.error.json(res, findError);
            }
            else {
               return API.success.json(res, classLocations);
            }
         });
      }
   };

   return actions;
};

module.exports = controller;
