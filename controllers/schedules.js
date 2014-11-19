var express 	= require('express'),
	passport 	= require('passport'),
	router		= express.Router(),
	apiRouter 	= express.Router()
	;

apiRouter.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {

});

router.api = apiRouter;

module.exports = router;
