module.exports = function() {

   var   _           = require('underscore'),
         nodemailer  = require('nodemailer')
         ;

   var APIUtility = {};
   var APIHelper = {};
   var CommonUtility = {};
   var HTTPUtility = {};
   var LoggerUtility = {};
   var MailerUtility = {};
   var TypeUtility = {};
   var ViewHelperUtility = {};

   /* API Utility */

   APIUtility.error = {
      json: function(res, errorObject, message, errorInfo) {

         var returnedObject = {
            success: false,
            system_error: {
               error: errorObject
            }
         };

         if (message) {
            returnedObject.message = message;
         }

         if (errorInfo) {
            returnedObject.system_error.message = errorInfo;
         }

         return res.status(500).json(returnedObject);
      }
   };

   APIUtility.forbidden = {
      json: function(res, message) {
         return res.status(403).json({
            success: false,
            message: message
         });
      }
   };

   APIUtility.invalid = {
      json: function(res, message) {
         return res.status(400).json({
            success: false,
            message: message
         });
      }
   };

   APIUtility.success = {
      json: function(res, responseObject, message, additionalData) {
         var returnedObject = {
            success: true
         };

         if (message) {
            returnedObject.message = message;
         }

         if (_.isArray(responseObject)) {
            returnedObject.results = responseObject;
         }
         else {
            returnedObject.result = responseObject;
         }

         for (var i in additionalData) {
            returnedObject[i] = additionalData[i];
         }

         return res.status(200).json(returnedObject);
      }
   };

   APIUtility.commonHandler = {
      json: function(res, error, responseObject, message, errorInfo) {
         if (error) {
            return APIUtility.error(res, error, errorInfo);
         }
         else {
            return APIUtility.success(res, responseObject, message);
         }
      }
   };

   /* API Helper */

   APIHelper.composeContinuousAdditionalData = function(results, params, baseUrl) {
      var convertObjectToQueryString = function(obj) {
         var results = [];
         Object.keys(obj).forEach(function(key) {
            results.push(key + '=' + obj[key]);
         });
         return results.join('&');
      };

      params = params || {};

      params['since'] = results[results.length - 1].created;

      var additionalData = {};
      additionalData.next = baseUrl + '?' + convertObjectToQueryString(params);

      return additionalData;
   };

   /* Misc. */

   CommonUtility.getWeek = function(d) {
      var onejan = new Date(d.getFullYear(), 0, 1);
      return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
   }

   /* For a given date, get the ISO week number
    *
    * Based on information at:
    *
    *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
    *
    * Algorithm is to find nearest thursday, it's year
    * is the year of the week number. Then get weeks
    * between that date and the first day of that year.
    *
    * Note that dates in one year can be weeks of previous
    * or next year, overlap is up to 3 days.
    *
    * e.g. 2014/12/29 is Monday in week  1 of 2015
    *      2012/1/1   is Sunday in week 52 of 2011
    */
   CommonUtility.getWeekNumber = function(d) {
       // Copy date so don't modify original
       d = new Date(+d);
       d.setHours(0,0,0);
       // Set to nearest Thursday: current date + 4 - current day number
       // Make Sunday's day number 7
       d.setDate(d.getDate() + 4 - (d.getDay()||7));
       // Get first day of year
       var yearStart = new Date(d.getFullYear(),0,1);
       // Calculate full weeks to nearest Thursday
       var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
       // Return array of year and week number
       return [d.getFullYear(), weekNo];
   }

   CommonUtility.getDayNameFromDayCode = function(code) {
      var days = [
         'Sunday',
         'Monday',
         'Tuesday',
         'Wednesday',
         'Thursday',
         'Friday',
         'Saturday'
      ];

      return days[code];
   };

   /* HTTP Helper Utility */

   HTTPUtility.convertQueryStringToQuery = function(params) {

   };

   /* Logger Helper Utility */

   LoggerUtility.printError = function(error) {
      var now = new Date();
      var strNow = now.toISOString();

      console.log('[' + strNow + '] Error!');
      console.log(error);
   };

   LoggerUtility.printMessage = function(message) {
      var now = new Date();
      var strNow = now.toISOString();

      console.log('[' + strNow + '] ' + message);
   };

   LoggerUtility.printMessages = function(messages) {
      var now = new Date();
      var strNow = now.toISOString();

      for (var i in messages) {
         console.log('-- ' + messages[i]);
      };
   };

   /* Mailer Utility */

   MailerUtility.sendMail = function() {

   };

   MailerUtility.sendMailWithTemplate = function(templateId, data, successCallback) {

   };

   /* Misc. */

   var getFlashMessages = function(req, res, next) {
      var flashMessages = [];
      var flashTypes = ['danger', 'info', 'success', 'warning'];
      for (var i in flashTypes) {
         var type = flashTypes[i];
         var message = req.flash(type);
         if (message.length > 0) {
            flashMessages.push({
               type: type,
               message: message[0]
            });
         }
      }

      return flashMessages;
   };

   /* Type Utility */

   TypeUtility.isDefAndNotNull = function(v) {
      return v != undefined && v != null;
   };

   TypeUtility.isDef = function(v) {
      return v != undefined;
   };

   TypeUtility.isNotNull = function(v) {
      return v != null;
   };

   /* View Helper Utility */

   ViewHelperUtility.getFlashMessages = function(req, res, next) {
      var flashMessages = [];
      var flashTypes = ['danger', 'info', 'success', 'warning'];
      for (var i in flashTypes) {
         var type = flashTypes[i];
         var message = req.flash(type);
         if (message.length > 0) {
            flashMessages.push({
               type: type,
               message: message[0]
            });
         }
      }

      return flashMessages;
   };

   return {
      API: APIUtility,
      APIHelper: APIHelper,
      Common: CommonUtility,
      Logger: LoggerUtility,
      Type: TypeUtility,
      ViewHelper: ViewHelperUtility
   };
};
