var Utils = {};

Utils.generateUrl = function(baseUrl, resourceUrl, queryStrings) {
   var url = baseUrl + resourceUrl;

   if (queryStrings != undefined && queryStrings != null) {
      url += '&';
      var k;
      for (k in queryStrings) {
         url += k + '=' + queryStrings[k];
      }
   }

   return url;
};
