var express = require("express"),
	mysql = require("mysql"),
	bodyParser = require("body-parser"),
	md5 = require('MD5'),
  http = require('http'),
	basicAuth = require('basic-auth'),
	Waterline = require('waterline'),
	mysqlAdapter = require('sails-mysql');

	// include and initialize the rollbar library with your access token
	var rollbar = require("rollbar");
	rollbar.init("1ae39e54dddd453594a7c3b0b2095ce4");

	// record a generic message and send to rollbar
	rollbar.reportMessage("development server has been restarted");

// require model
var userModel = require("./model/users.js");
var driverModel = require("./model/driver.js");
var smtpModel = require("./model/smtp.js");
var transactionModel = require("./model/transaction.js");
var historyModel = require("./model/history.js");
var promoModel = require("./model/promo.js");
var multidriverModel = require("./model/multidriver.js");
var dashboardModel = require("./model/dashboard.js");
var bookingModel = require("./model/booking.js");
// end of require model

var app = express();

//jwt
var jwt = require('jsonwebtoken');
app.set('superSecret', 'ilovenode8');
//var token = jwt.sign({ foo: 'bar' }, 'shhhhh'); // sign with default (HMAC SHA256)
// end of jwt

// basicAuth
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'distra' && user.pass === 'damn5hit') {
    return next();
  } else {
    return unauthorized(res);
  };
};
// end of basicAuth

// for website purpose
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// end of bodyParser

// start of function connect
function connect(){
	var self = this;
	self.connectMysql();
};
// end of function connect

// start connect mysql
connect.prototype.connectMysql = function() {
	var self = this;
  var pool = mysql.createPool({
     sconnectionLimit : 100,
     multipleStatements: true,
		 module		: 'sails-mysql',
    //  host     : '52.76.73.21',
    //  user     : 'edwinslab',
    //  password : 'edwinslab888',
    //  database : 'valletUncle',
		host     : 'valetunclelive.crdghclhttrn.ap-southeast-1.rds.amazonaws.com',
		user     : 'vu_userdb',
		password : 'damn5hitfuck5ake',
		database : 'valetuncle',
     debug    :  false
  });

	pool.getConnection(function(err,connection){
			if(err) {
				throw err;
			} else {
				self.configureExpress(connection);
			}
	});
}
// end of connect mysql

// start of configureExpress
connect.prototype.configureExpress = function(connection) {
	var self = this;
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        // get an instance of the router for api routes
        var router = express.Router();

        //new authenticate
        router.post('/newAuth',auth, function(req, res) {

           // if user is found and password is right
                // create a token
                var token = jwt.sign(users, app.get('superSecret'), {
                 expiresInMinutes: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                  success: true,
                  message: 'Enjoy your token!',
                  token: token
                });

        });

        //old authenticate
        router.post('/authenticate', function(req, res) {

           // if user is found and password is right
                // create a token
                var token = jwt.sign(users, app.get('superSecret'), {
                 expiresInMinutes: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                  success: true,
                  message: 'Enjoy your token!',
                  token: token
                });

        });

        // route middleware to verify a token
        router.use(function(req, res, next) {

          // check header or url parameters or post parameters for token
          var token = req.body.token || req.query.token || req.headers['x-access-token'];

          // decode token
          if (token) {

            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
              if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
              } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
              }
            });

          } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

          }
        });

        // apply the routes to our application with the prefix /api
        app.use('/api', router);

				// calling model
        var users = new userModel(router,connection,md5);
        var smtp = new smtpModel(router,connection,md5);
        var driver = new driverModel(router,connection,md5);
        var transaction = new transactionModel(router,connection,md5);
				var history = new historyModel(router,connection,md5);
				var promo = new promoModel(router,connection,md5);
				var multidriver = new multidriverModel(router,connection);
				var dashboard = new dashboardModel(router,connection);
				var booking = new bookingModel(router,connection);
				// end of calling model

        self.startServer();
};
// end of configureExpress

// start server
connect.prototype.startServer = function() {
	app.listen(3000,function(){
      console.log("WELCOME TO TESTING SERVER");
  });
};
// end of start server

// start of stop server
connect.prototype.stop = function(err) {
	console.log("ISSUE WITH MYSQL \n"+ err);
	process.exit(1);
};
// end of stop server

new connect();
