var   mongoose = require('mongoose'),
   Schema      = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var classLocation = new Schema({
   name        :  {type: String, index: true},
   description :  String,

   created     :  Date,
   modified    :  {type: Date, default: new Date()}
}, {collection: 'class_locations'});

module.exports = mongoose.model('ClassLocation', classLocation);
