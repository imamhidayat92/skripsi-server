console.log();
console.log('Script executed at ' + (new Date()));
console.log();

var
   express        = require('express'),
   session        = require('express-session'),
   bodyParser     = require('body-parser'),
   cookieParser   = require('cookie-parser'),
   flash          = require('connect-flash'),
   morgan         = require('morgan'),
   compression    = require('compression'),
   mongoose       = require('mongoose'),
   redis          = require('redis'),
   RedisStore     = require('connect-redis')(session),
   passport       = require('passport'),

   /* Main Server App Object */
   app            = express(),
   server         = require('http').Server(app),
   io             = require('socket.io')(server),

   /* Passport Strategy */
   BearerStrategy = require('passport-http-bearer').Strategy,
   LocalStrategy  = require('passport-local').Strategy,

   /* Internal Libraries */
   auth           = require('./libs/auth')(),
   utils          = require('./libs/utils')(),

   /* Server Configuration */
   config         = require('./config'),

   User           = require('./models/UserSchema')
   ;

/* Connecting app to Redis. */
var redisClient = redis.createClient();

redisClient.on("error", function (err) {
   console.log("Redis error: " + err);
});

redisClient.on("ready", function (err) {
   console.log(config.app.name + " successfully connected to Redis.");
});

/* Connecting app to MongoDB. */
mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.collection, function(err) {
   if (err) console.log("MongoDB error: " + err);
   else console.log(config.app.name + " successfully connected to MongoDB.");
});

/* Set views directory and engine. */
app.set('views', './views');
app.set('view engine', 'jade');

/* Set body parser for request sent to the server. */
app.use(bodyParser.urlencoded({
   extended: true
}));

/* Set cookie parser for request sent to the server. */
app.use(cookieParser(config.security.cookie_secret))

/* Set up session using RedisStore. */
app.use(session({
   cookie: { maxAge: config.security.session_timeout },
   secret: config.security.session_secret,
   store: new RedisStore({ host: config.redis.host, port: config.redis.port, client: redisClient }),
   saveUninitialized: true,
   resave: true
}));

/* Set up flash message. */
app.use(flash());

/* Setting Up Passport */
passport.use(new BearerStrategy(
   function(token, done) {
      User.findOne({ "token": token }, function (err, user) {
         if (err) { return done(err, false, {message: "Error."}); }
         if (!user) { return done(null, false, {message: "Unauthorized."}); }
         return done(null, user, { scope: 'all' });
      });
   }
));

passport.use(new LocalStrategy(
   {
      usernameField: 'email',
      passwordField: 'password'
   },
   function(email, password, done) {
      User.findOne({email: email}, function(err, user) {
         if (err) {
            console.log(err);
            return done(err);
         }
         if (!user) {
            console.log('Incorrect email.');
            return done(null, false, { message: 'Incorrect email.' });
         }
         if (!user.validPassword(password)) {
            console.log('Incorrect password.');
            return done(null, false, { message: 'Incorrect password.' });
         }
         console.log(user);
         return done(null, user);
      });
   }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

app.use(passport.initialize());
app.use(passport.session());

/* Minify output. */
app.use(compression());

/* Set up logger. */
app.use(morgan(config.morgan.mode));

/* Set static file location. */
app.use(express.static(__dirname + '/public'));

/* Set arguments to be bypassed to every controller. */
var args = {
   auth        : auth,
   config      : config,
   io          : io,
   pages       : {
      FORBIDDEN               : '../../../views/errors/403',
      INTERNAL_SERVER_ERROR   : '../../../views/errors/5xx',
      NOT_FOUND               : '../../../views/errors/404'
   },
   passport    : passport,
   redisClient : redisClient,
   utils       : utils
};

/* Global function for every controller actions. */
var initGlobal = function(app) {
   app.all('*', function(req, res, next) {
      if (typeof req.user != 'undefined') {
         res.locals.user = req.user;
      }

      res.locals.current = {
         url   : req.protocol + '://' + req.get('host') + req.originalUrl,
         user  : req.user
      };

      res.locals.helper = utils.ViewHelper;

      next();
   });
};

/* Boot up! Set up all controllers. */
var boot = require('./libs/boot');
initGlobal(app);
boot(app, args, { verbose: !module.parent, initGlobal: initGlobal });

/* Initialize socket.io for realtime application. */
io.on('connection', function(socket) {

});

/* Handle internal server error and render a view. */
app.use(function(err, req, res, next){
   if (!module.parent) console.error(err.stack);
   res.status(500).render('errors/5xx');
});

/* Handle not found error and render a view. */
app.use(function(req, res, next){
   res.status(404).render('errors/404', { url: req.originalUrl });
});

/* Run! */
server.listen(config.app.port, function () {
   console.log(config.app.name + ' listening at localhost port ' + config.app.port);
   console.log();
});
