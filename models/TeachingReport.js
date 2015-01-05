var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var teachingReportSchema = new Schema({
	subject		: 	String,
	description	: 	String,
	
	lecturer	: 	{type: ObjectId, ref: 'User'},

	attendances	: 	[{type: ObjectId, ref: 'Attendance'}],

	created		: 	Date
}, {collection: 'teaching_reports'});

module.exports = mongoose.model('TeachingReport', teachingReportSchema);
