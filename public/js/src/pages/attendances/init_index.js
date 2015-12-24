$(document).ready(function() {
   var selectors = {
      userList: '#userList'
   };

   

   var componentLocatorInstance = new ComponentLocator();
   // Attendance Index Page
   new IndexPage(seletors).render();
});
