var
   mongoose = require('mongoose'),
   crypto   = require('crypto'),
   Schema   = mongoose.Schema,
   ObjectId = Schema.ObjectId
   ;

var userSchema = new Schema({
   provider          :  String,
   email             :  {type: String, lowercase: true, trim: true,index: {unique: true}},
   address           :  String,
   name              :  String,
   phone             :  String,
   display_name      :  String,

   hashed_password   :  String,
   role              :  {type: String, lowercase: true, enum:['administrator', 'lecturer', 'student', 'staff']},
   display_picture   :  String,

   identifier        :  {type: String, trim: true, index: {sparse: true}},
   id_number         :  {type: String, trim: true, index: {sparse: true}},

   major             :  {type: ObjectId, ref: 'Major'},

   /* Cache */

   // For Students
   attendances       :  [{type: ObjectId, ref : 'Attendance'}],
   enrollments       :  [{type: ObjectId, ref : 'Enrollment'}],
   contact_info      :  [{type: ObjectId, ref : 'ContactInfo'}],
   
   // For Lecturers
   class_meetings    :  [{type: ObjectId, ref : 'ClassMeeting'}],
   schedules         :  [{type: ObjectId, ref : 'Schedule'}],
   teaching_reports  :  [{type: ObjectId, ref : 'TeachingReport'}],

   token             :  String,

   salt              :  String,
   hash              :  String,

   activation        :  {
                           token: String,
                           created: Date,
                           expired: Date
                        },

   created           :  {type: Date},
   modified          :  {type: Date}
}, {collection: 'users', toObject: { getters: true, virtuals: true }});

userSchema.virtual('password')
.set(function(password) {
   this._password = password;
   this.salt = this.makeSalt();
   this.hashed_password = this.encryptPassword(password);
   this.token = this.generateToken();
})
.get(function() {
   return this._password
});

userSchema.virtual('created_ms')
.get(function() {
   if (this.created) {
      return this.created.getTime();
   }
   return 0;
});

userSchema.virtual('modified_ms')
.get(function() {
   if (this.modified) {
      return this.modified.getTime();
   }
   return 0;
});

userSchema.methods = {
   authenticate: function(plainText) {
      return this.encryptPassword(plainText) === this.hashed_password
   },

   makeSalt: function() {
      return Math.round((new Date().valueOf() * Math.random())) + ''
   },

   encryptPassword: function(password) {
      if (!password) return ''
         return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
   },

   generateActivation: function() {
      this.activation.token = crypto.createHmac('sha1',this.makeSalt()).update(this.email).digest('hex');
      this.activation.created = Date.now();
      this.activation.expired = Date.nextWeek();
      return this.activation.token;
   },

   generateToken: function() {
      this.token = crypto.createHmac('sha1', this.makeSalt()).update(this.email).digest('hex');
      return this.token;
   },

   validPassword: function(password) {
      if (!password) return false;
      if (this.encryptPassword(password) != this.hashed_password) return false;
      return true;
   },
};

module.exports = mongoose.model('User', userSchema);
