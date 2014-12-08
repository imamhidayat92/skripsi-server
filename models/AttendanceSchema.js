var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var attendanceSchema = new Schema({
	created		: 	{type: Date, default: new Date()},

	schedule	: 	{type: ObjectId, ref: 'Schedule'},
	report		: 	{type: ObjectId, ref: 'TeachingReport'},
}, {collection: 'majors'});

module.exports = mongoose.model('Attendance', attendanceSchema);
