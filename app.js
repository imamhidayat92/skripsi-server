var express 	= require('express'),
	session		= require('express-session'),
	bodyParser	= require('body-parser'),
	morgan		= require('morgan'),
	compression	= require('compression'),
	mongoose	= require('mongoose'),
	redis 		= require('redis'),
	RedisStore 	= require('connect-redis')(session),
	app			= express(),

	config		= require('./config'),
	User 		= require('./models/UserSchema')
	;

/* Connecting app to Redis. */
redis = redis.createClient();

redis.on("error", function (err) {
	console.log("Redis error: " + err);
});

redis.on("ready", function (err) {
	console.log(config.app.name + " successfully connected to Redis.");
});

/* Connecting app to MongoDB. */
mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.collection, function(err) {
    if (err) console.log("MongoDB error: " + err);
    else console.log(config.app.name + " successfully connected to MongoDB.");
});

/* Setting Up Passport */
passport.use(new BearerStrategy(
	function(token, done) {
		User.findOne({ "token": token }, function (err, user) {
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			return done(null, user, { scope: 'all' });
		});
	}
));

/* Set views directory and engine. */
app.set('views', './views');
app.set('view engine', 'jade');

/* Set body parser for request sent to the app. */
app.use(bodyParser.urlencoded({
	extended: true
}));

/* Set up session using RedisStore. */
app.use(session({
	cookie: { maxAge:	config.security.session_timeout },
	secret: config.security.session_secret,
	store: new RedisStore({ host: config.redis.host, port: config.redis.port, client: redis}),
	saveUninitialized: true,
    resave: true
}));

/* Minify output. */
app.use(compression());

/* Set up logger. */
app.use(morgan(config.morgan.mode));

/* Set static file location. */
app.use(express.static(__dirname + '/public'));

/* Boot up! Set up all controllers needed. */
require('./libs/boot')(app, { verbose: !module.parent });

/* Handle internal server error and render a view. */
app.use(function(err, req, res, next){
	if (!module.parent) console.error(err.stack);
	res.status(500).render('core/errors/5xx');
});

/* Handle not found error and render a view. */
app.use(function(req, res, next){
	res.status(404).render('core/errors/404', { url: req.originalUrl });
});

/* Run! */
var server = app.listen(config.app.port, function () {

	var host = server.address().address
	var port = server.address().port

	console.log(config.app.name + ' listening at localhost port ' + port);

});