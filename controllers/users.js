var express = require('express'),
	router	= express.Router(),
	apiRouter = express.Router()
	;

apiRouter.post('/', function(req, res) {

});

apiRouter.get('/:user_id', function(req, res) {

});

apiRouter.patch('/:user_id', function(req, res) {

});

apiRouter.get('/:user_id/schedules', function(req, res) {

});

router.api = apiRouter;

module.exports = router;
