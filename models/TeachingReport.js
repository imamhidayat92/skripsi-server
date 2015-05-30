var   mongoose = require('mongoose'),
   Schema      = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var teachingReportSchema = new Schema({
   subject       :   String,
   description   :   String,

   class_meeting :   {type: ObjectId, ref: 'ClassMeeting'},
   course        :   {type: ObjectId, ref: 'Course'},
   lecturer      :   {type: ObjectId, ref: 'User'},

   created       :   Date,
   modified      :   {type: Date, default: new Date()}
}, {collection: 'teaching_reports'});

module.exports = mongoose.model('TeachingReport', teachingReportSchema);
