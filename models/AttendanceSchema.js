var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var attendanceSchema = new Schema({
	status			: 	{type: String, lowercase: true, enum:['present', 'unknown', 'special_permission']},
	remarks 		: 	{type: String},

	class_meeting	: 	{type: ObjectId, ref: 'ClassMeeting'},
	student			: 	{type: ObjectId, ref: 'User'},
	schedule		: 	{type: ObjectId, ref: 'Schedule'},

	created			: 	Date,
	modified		: 	{type: Date, default: new Date()}
}, {collection: 'attendances'});

module.exports = mongoose.model('Attendance', attendanceSchema);