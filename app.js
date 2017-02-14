/*App.js for start the whole system,node run*/
/*ExpressJS,PassportJS,morgin,compression,body-parser,method-override,cookie parser*/
var express = require('express'),
    http = require('http'),
    passport = require('passport'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),  
    favicon = require('serve-favicon'),
    assert = require('assert'), 
    mongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;

//Start
var app = express();
app.use(morgan());
app.use(compress());
app.use(bodyParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride());
app.use(cookieParser());

//cookie setting, maxAge=expire date in second
app.use(session({
    secret : 'almvnirtgd#$DFsa25452*AYD*D*S!@!#adsda))Ddsadsax',
    cookie: {httpOnly: true, secure: false, maxAge: 900000},
    store: new session.MemoryStore()
}));
//passportJS start
app.use(passport.initialize());
app.use(passport.session());

//序列化
passport.serializeUser(function(user, done) {
    done(null, user);
});
//反序列化
passport.deserializeUser(function(user, done) {
    done(null, user);
});
//获取网站page icon
app.use(favicon(__dirname + '/public/favicon.ico'));

//log in status
var isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {      
        console.log('now comes in error page');
        res.redirect('/');
    }
};
//http=400,bad request; http=500,internal server error
app.post('/api/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, message) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send({loginStatus: false, msg: message});
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.send({msg: 'Error logging in', err: err}, 500);
            }
            return res.send({loginStatus: true, user: user});
        });
    })(req, res, next);
});
//log in status
app.get('/api/session', isLoggedIn, function(req, res) {
    res.send({
        loginStatus: true,
        user: req.user
    });
});


/*Database module*/
var db;

/*stantard mongoClient-plain mongoDB,No mongoose*/
mongoClient.connect('mongodb://timyaohoyt:lion9900@ds031257.mlab.com:31257/tablereservesita', function (err, database) {
    if(err) return console.log(err);
    db = database;
    
});

//post data to datapage
app.post('/api/makeReserve', function(req, res){
    db.collection('reservations').save(req.body, function(err, result){
        if(err) return console.log(err);

        console.log(req.body);
        res.send({id: result.ops[0]._id});
    })
});


app.post('/api/getReserve', function (req, res) {
    var obj_id = new ObjectID(req.body.id);
    
    db.collection('reservations').find({_id: obj_id}).toArray(function (err, result) {
        res.send(result);
    });
});

app.post('/api/changeReserve', function (req, res) {
    var obj_id = new ObjectID(req.body[0]._id);
    var term = req.body[0];
    term["_id"] = obj_id;
    db.collection('reservations').findOneAndReplace({_id: obj_id}, term);
    
    res.send("success");
});

app.post('/api/cancelReserve', function (req, res) {
    var obj_id = new ObjectID(req.body.id);

    db.collection('reservations').remove({_id: obj_id}).then(function (err, result) {
        res.send(result);
    });
});

app.get('/api/getAllReserve', isLoggedIn, function (req, res) {
    db.collection('reservations').find().toArray(function (err, result) {
        res.send(result);
    });
});


app.post('/api/changeState', isLoggedIn, function (req, res) {
    var obj_id = new ObjectID(req.body.id);
    db.collection('reservations').find({_id: obj_id}).toArray(function (err, result) {
        if(err){
            console.log(err);
        }
        console.log(req.body);
        
        
        var send = result[0];
        send.table = req.body.table;
        send.status = (send.status == "pending") ? "success" : "pending";
        console.log(send);
        db.collection('reservations').findOneAndReplace({_id: obj_id}, send);
        res.send('success');
    });

});

//port9999
var port = process.env.PORT || 9999;
app.listen(port);
console.log('Excess page at http://localhost:' + port);

