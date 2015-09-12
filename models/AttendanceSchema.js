var
   mongoose = require('mongoose'),
   Schema      = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var attendanceSchema = new Schema({
   status         :  {type: String, lowercase: true, enum:['present', 'unknown', 'special_permission']},
   remarks        :  {type: String},
   verified       :  {type: Boolean}, // Special requirements. Ignore for this time.

   class_meeting  :  {type: ObjectId, ref: 'ClassMeeting'},
   schedule       :  {type: ObjectId, ref: 'Schedule'},
   student        :  {type: ObjectId, ref: 'User'},

   created        :  Date,
   modified       :  {type: Date, default: new Date()}
}, {collection: 'attendances', toObject: { getters: true, virtuals: true }});

attendanceSchema.virtual('created_ms')
.get(function() {
   return this.created.getTime();
});

attendanceSchema.virtual('modified_ms')
.get(function() {
   return this.modified.getTime();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
