var express 	= require('express'),
	passport	= require('passport'),
	router		= express.Router(),
	apiRouter 	= express.Router()
	;

apiRouter.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {

});

apiRouter.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {

});

apiRouter.get('/:course_id', passport.authenticate('bearer', { session: false }), function(req, res) {

});

apiRouter.patch('/:course_id', passport.authenticate('bearer', { session: false }), function(req, res) {

});

router.api = apiRouter;

module.exports = router;
