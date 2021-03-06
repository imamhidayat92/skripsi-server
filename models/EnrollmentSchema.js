var
   mongoose = require('mongoose'),
   Schema   = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var enrollmentSchema = new Schema({
   status         :  Boolean,

   course         :  {type: ObjectId, ref: 'Course'},
   schedule       :  {type: ObjectId, ref: 'Schedule'},

   lecturer       :  {type: ObjectId, ref: 'User'},
   student        :  {type: ObjectId, ref: 'User'},

   created        :  Date,
   modified       :  Date
}, {collection: 'enrollments'});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
