var auth = function() {
	var	_ 			= require('underscore'),
		passport	= require('passport')
		;

	var utils		= require('../../libs/utils'),
		API 		= utils.API
		;

	var obj = {}
		;

	obj.check = function(req, res, next) {
		passport.authenticate('bearer', function(err, user, info) {
			if (req.originalUrl.indexOf('/api/') != -1) {
				if (err) {
					return API.error(res, err);
				}

				if (!user) {
					return API.forbidden(res, 'Anda tidak diizinkan untuk mengakses sumber daya ini.');
				}

				req.logIn(user, function(err) {
					if (err) {

					}
					else {
						next();
					}
				});
			}
			else {
				if (err) { return next(err); }
				if (!user) { return res.redirect('/users/login'); }
				
				req.logIn(user, function(err) {
					if (err) { return next(err); }
					return res.redirect('/users/' + user.username);
				});
			}
		})(req, res, next);
	}

	return obj;
};

module.exports = auth;
