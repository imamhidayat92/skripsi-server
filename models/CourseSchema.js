var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var courseSchema = new Schema({
	name		: 	{type: String, index: true},
	description	: 	String
}, {collection: 'courses'});

module.exports = mongoose.model('Course', courseSchema);
