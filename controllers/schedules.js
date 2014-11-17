var express = require('express'),
	router	= express.Router(),
	apiRouter = express.Router()
	;

apiRouter.get('/', function(req, res) {

});

router.api = apiRouter;

module.exports = router;
