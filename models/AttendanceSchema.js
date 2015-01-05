var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var attendanceSchema = new Schema({
	student		: 	{type: ObjectId, ref: 'User'},
	schedule	: 	{type: ObjectId, ref: 'Schedule'},

	created		: 	Date
}, {collection: 'attendances'});

module.exports = mongoose.model('Attendance', attendanceSchema);
