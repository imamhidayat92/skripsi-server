var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var classMeetingSchema = new Schema({
	type		: 	{type: String, lowercase: true, trim: true, enum:['default', 'general', 'mid-test', 'final-test']},
	
	course 		: 	{type: ObjectId, ref: 'Course'},
	lecturer 	: 	{type: ObjectId, ref: 'User'},
	report		: 	{type: ObjectId, ref: 'Report'},
	schedule	: 	{type: ObjectId, ref: 'Schedule'},

	attendances	: 	[{type: ObjectId, ref: 'Attendance'}],

	created		: 	Date,
	modified	: 	{type: Date, default: new Date()}
}, {collection: 'class_meetings'});

module.exports = mongoose.model('ClassMeeting', classMeetingSchema);