var express = require('express');
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('config');
var app = express();

// ================ DB CONFIG ================
mongoose.connect(config.databaseURL);

// ================ ROUTES ================
var messengerRoute = require('./app/routes/messenger.js');
var foodItemRoute = require('./app/routes/fooditem');


// ================ EXPRESS SETUP ================
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//middleware to use for all requests
var myLogger = function(req, res, next) {
    //log (Do analytics for all request , do a common task like verification here)
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log("A request came:- " + fullUrl);
    next(); //make sure we go to the next routes and not stop here
};

app.use(myLogger);

// ================ DEFINE ROUTES ================
app.use('/fooditem', foodItemRoute);
app.use('/', messengerRoute);

//START THE SERVER
// ======================================================
var port = 1337; //set our port
app.listen(port);
console.log('Server running at port :- ' + port);