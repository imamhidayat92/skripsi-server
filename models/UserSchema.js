require('date-utils');

var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var userSchema = new Schema({
	provider: String,
	email: {type: String, lowercase: true, trim: true,index: {unique: true}},
	domain: {type: String, lowercase: true, trim: true},
	hashed_password: String,
	role: {type: String, lowercase: true, enum:['administrator', 'lecturer', 'student']},
	avatar: String,
	name: String,

	identifier: {type: String, trim: true, index: {unique: true}},
	id_number: type: String,
	
	/* For students: */
	major: {type: Schema.ObjectId, ref: 'Major'},
	enrollments: [{type: Schema.ObjectId, ref : 'Schedule'}],

	/* For lecturers: */
	schedules: [{type: Schema.ObjectId, ref : 'Schedule'}],

	salt: String,
	hash: String,

	activation: {
		token: String,
		created: Date,
		expired: Date
	}
}, {collection: 'users'});

userSchema.virtual('password')
.set(function(password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashed_password = this.encryptPassword(password);
})
.get(function() { 
	return this._password 
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

	generateActivation: function(){
		this.activation.token = crypto.createHmac('sha1',this.makeSalt()).update(this.email).digest('hex');
		this.activation.created = Date.now();
		this.activation.expired = Date.nextWeek();
		return this.activation.token;
	},

	validPassword: function(password) {
		if (!password) return false;
		if(this.encryptPassword(password)!=this.hashed_password) return false;
		return true;
	},
};

module.exports = mongoose.model('User', userSchema);
