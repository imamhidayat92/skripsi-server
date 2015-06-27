var
   mongoose = require('mongoose'),
   Schema   = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var activitySchema = new Schema({

   affected_model :  {type: String, lowercase: true, enum: ['Attendance', 'ClassMeeting', 'Schedule', 'TeachingReport']}
   message        :  {type: String},
   extra_data     :  {type: Mixed},

   involved_users :  [{type: ObjectId, ref: 'User'}],
   
   created        :  Date,

}, {collection: 'activities'});

module.exports = mongoose.model('Activity', activitySchema);
