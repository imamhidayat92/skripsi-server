var
   mongoose = require('mongoose'),
   crypto   = require('crypto'),
   Schema   = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var contactInfoSchema = new Schema({
   father_name          : String,
   mother_name          : String,
   representative_name  : String,
   address              : String,
   phone                : String,
   email                : String,
   mobile_phone         : String,

   student              : [{type: ObjectId, ref: 'User'}],

   created              : {type: Date},
   modified             : {type: Date}
}, { collection: 'contact_infos' });


contactInfoSchema.virtual('created_ms')
.get(function() {
   if (this.created) {
      return this.created.getTime();
   }
   return 0;
});

contactInfoSchema.virtual('modified_ms')
.get(function() {
   if (this.modified) {
      return this.modified.getTime();
   }
   return 0;
});

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
