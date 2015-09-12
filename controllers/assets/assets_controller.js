var path = require('path');

var controller = function(args) {
   var actions = {};

   /* API Actions */

   actions.api_display_pictures = {
      path     : '/display_pictures/:id',
      prefix   : 'api',
      method   : 'get',
      handler  : function(req, res, next) {
         var options = {
            root: path.normalize(__dirname + '/../../public/assets/display_pictures/')
         };

         return res.sendFile(req.params.id, options, function(err) {
            if (err) {
               console.log(err);
               return res.status(500).json({
                  success: false
               });
            }
         });
      }
   };

   return actions;
}

module.exports = controller;
