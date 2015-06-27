var initConst = function() {
   var Model = {
      ACTIVITY: 'Activity',
      ATTENDANCE: 'Attendance',
      CLASS_MEETING: 'ClassMeeting',
      TEACHING_REPORT: 'TeachingReport'
   };

   return {
      Model: Model
   }
};

var const = initConst();

module.exports = const;
