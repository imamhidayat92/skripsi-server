var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var teachingReportSchema = new Schema({
	created		: 	{type: Date, default: new Date()},
	subject		: 	String,
	description	: 	String,
	
	attendance	: 	{type: ObjectId, ref: 'Attendance'}
}, {collection: 'majors'});

module.exports = mongoose.model('TeachingReport', teachingReportSchema);
