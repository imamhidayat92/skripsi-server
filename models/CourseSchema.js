var   mongoose = require('mongoose'),
   Schema      = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var courseSchema = new Schema({
   name              :  {type: String, index: true},
   credits           :  Number,
   description       :  String,

   major             :  {type: ObjectId, ref: 'Major'},

   /* Cache */
   class_meetings    :  [{type: ObjectId, ref: 'ClassMeeting'}],

   created           :  Date,
   modified          :  {type: Date, default: new Date()}
}, {collection: 'courses'});

module.exports = mongoose.model('Course', courseSchema);
