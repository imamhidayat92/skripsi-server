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

	majors			: 	{type: ObjectId, ref: 'Major'},
	students		: 	{type: ObjectId, ref: 'User'}
}, {collection: 'schedules'});

module.exports = mongoose.model('CourseSchedule', scheduleSchema);
