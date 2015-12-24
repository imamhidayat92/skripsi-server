var Activity         = require('./models/ActivitySchema');
var Attendance       = require('./models/AttendanceSchema');
var Course           = require('./models/CourseSchema');
var Enrollment       = require('./models/EnrollmentSchema');
var Schedule         = require('./models/ScheduleSchema');
var TeachingReport   = require('./models/TeachingReportSchema');

function CacheManager(redisClient) {
   this._redisClient = redisClient;

   this._init();
}

CacheManager.prototype._init = function() {

};

// Public Functions

CacheManager.prototype.get = function() {
   
};

CacheManager.prototype.set = function(k, v) {

};

module.exports = CacheManager;
