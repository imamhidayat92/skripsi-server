var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var scheduleSchema = new Schema({
	day_code		: 	Number,
	start_time		: 	String,
	end_time		: 	String,

	course 			: 	{type: ObjectId, ref: 'Course'},
	lecturer		: 	{type: ObjectId, ref: 'User'},

	enrollments		: 	[{type: ObjectId, ref: 'Enrollment'}],

	created			: 	Date,
	modified		: 	{type: Date, default: new Date()}
}, {collection: 'schedules'});

module.exports = mongoose.model('Schedule', scheduleSchema);
