var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
var checkToken = require('./middlewares/checkToken');

// Importa o Handlebars para registrar helpers
var hbs = require('hbs');

var indexRouter = require('./routes/indexRouter');
var authRouter = require('./routes/authRouter');
var painelRouter = require('./routes/painelRouter');

var app = express();

// REGISTRO DO HELPER 'EQ'
// Este helper compara dois valores e retorna true ou false.
hbs.registerHelper('eq', function (arg1, arg2) {
    return (arg1 == arg2);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/dashboard', checkToken, painelRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

mongoose
    .connect('mongodb://localhost:27017/login')
    .then(() => console.log('Banco de dados conectado'))
    .catch(err => console.error('Erro de conexão ao banco de dados:', err));

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;