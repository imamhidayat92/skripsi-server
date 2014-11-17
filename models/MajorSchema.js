var	mongoose	= require('mongoose'),
	Schema		= mongoose.Schema,
	ObjectId	= Schema.ObjectId
	;

var majorSchema = new Schema({
	name: String,
	color: String
}, {collection: 'majors'});

module.exports = mongoose.model('Major', majorSchema);
