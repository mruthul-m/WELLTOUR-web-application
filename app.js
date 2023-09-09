var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes');
var adminRouter = require('./routes/admin');
var centerRouter = require('./routes/center');

//addedbyme

var hbs = require('express-handlebars');
var app = express();

//lib to upload files
var fileUpload = require('express-fileupload')

//db obj
var db = require('./config/connection');
var session = require('express-session')

//suspicious
const e = require('express');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//adding template engine
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware for file uploads
app.use(fileUpload());

//use session
app.use(session({secret:"Key",cookie:{maxAge:6000000}}))


//db
db.connect((err)=>{
  
  if(err) console.log("Connection Error.!"+err);

  else console.log("Database Connected!");
  
})

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/center', centerRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




//temp tesing only
//worker-edit-item/:id
//let item = await itemHelpers.getWorkItems(req.params.id)
//res.render('workers/worker-edit-item',{worker:true,item})


//app.get('/wokrer-edit-item/:id', function(req, res) {
  //res.send('worker-edit-item' + req.params.id);    
//});




module.exports = app;
