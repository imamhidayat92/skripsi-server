var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var courseSchema = new Schema({
	name: {type: String, index: true}
}, {collection: 'courses'});

module.exports('Course', courseSchema);
