var express = require('express'),
	router	= express.Router(),
	apiRouter = express.Router()
	;

apiRouter.get('/', function(req, res) {

});

apiRouter.post('/', function(req, res) {

});

apiRouter.get('/:course_id', function(req, res) {

});

apiRouter.patch('/:course_id', function(req, res) {

});

router.api = apiRouter;

module.exports = router;
