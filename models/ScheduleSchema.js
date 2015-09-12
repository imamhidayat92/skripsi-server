var
   mongoose = require('mongoose'),
   Schema   = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var scheduleSchema = new Schema({
   day_code    :  Number,
   start_time  :  String,
   end_time    :  String,

   course      :  {type: ObjectId, ref: 'Course'},
   lecturer    :  {type: ObjectId, ref: 'User'},
   location    :  {type: ObjectId, ref: 'ClassLocation'},

   /* Cache */
   enrollments :  [{type: ObjectId, ref: 'Enrollment'}],
   meetings    :  [{type: ObjectId, ref: 'ClassMeeting'}],

   created     :  Date,
   modified    :  {type: Date, default: new Date()}
}, {collection: 'schedules', toObject: { getters: true, virtuals: true }});

scheduleSchema.virtual('created_ms')
.get(function() {
   return this.created.getTime();
});

scheduleSchema.virtual('modified_ms')
.get(function() {
   return this.modified.getTime();
});

module.exports = mongoose.model('Schedule', scheduleSchema);
