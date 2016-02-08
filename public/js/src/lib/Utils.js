var Utils = {};

Utils.capitalizeFirstLetter = function(str) {
   var strSplit = str.split('');
   strSplit[0] = strSplit[0].toUpperCase();
   return strSplit.join('');
};

Utils.convertObjectToQueryString = function(data) {
   var result = '';
   var counter = 0;
   for (var k in data) {
      if (!data.hasOwnProperty(k)) { continue; }
      // Strip empty string value.
      if (typeof data[k] === 'string' && data[k].trim().length == 0) { continue; }
      result += counter == 0 ? '?' : '&';
      result += k + '=' + data[k];
   }
   return result;
};

// UI Positioning

Utils.scrollToTop = function() {
   window.scrollTo(0, 0);
};

Utils.scrollToElement = function(selector) {
   window.scrollTo(0, 0);
};

// Function Generator

Utils.generateProperCallback = function(callback) {
   if (callback === undefined || callback === null) {
      return function() {

      };
   }
   else {
      return callback;
   }
};
