var   mongoose = require('mongoose'),
   Schema      = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var majorSchema = new Schema({
   name        :  String,
   color       :  String,
   description :  String,

   /* Cache */
   students    :  [{type: ObjectId, ref: 'User'}],
   courses     :  [{type: ObjectId, ref: 'Course'}]

}, {collection: 'majors'});

module.exports = mongoose.model('Major', majorSchema);
