var
   mongoose = require('mongoose'),
   Schema      = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var teachingReportSchema = new Schema({
   subject       :   String,
   description   :   String,

   class_meeting :   {type: ObjectId, ref: 'ClassMeeting'},
   course        :   {type: ObjectId, ref: 'Course'},
   lecturer      :   {type: ObjectId, ref: 'User'},

   /* Cache */
   attendances   :   [{type: ObjectId, ref: 'Attendance'}],

   created       :   Date,
   modified      :   {type: Date, default: new Date()}
}, { collection: 'teaching_reports', toObject: { getters: true, virtuals: true } });

teachingReportSchema.virtual('created_ms')
.get(function() {
   return this.created.getTime();
});

teachingReportSchema.virtual('modified_ms')
.get(function() {
   return this.modified.getTime();
});


module.exports = mongoose.model('TeachingReport', teachingReportSchema);
