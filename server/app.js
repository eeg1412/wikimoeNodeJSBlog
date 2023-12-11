var express = require('express');
const log4js = require('log4js')
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
require('./mongodb')
var history = require('connect-history-api-fallback');

var adminRouter = require('./routes/admin');

var app = express();

app.use(log4js.connectLogger(log4js.getLogger('access'), { level: 'auto' }))

// app.use(logger('dev'));
app.use(express.json({ limit: process.env.JSON_LIMT || '10mb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.URLENCODED_LIMT || '10mb' }));
app.use(cookieParser());
app.use('/upload', express.static(path.join(__dirname, 'public/upload')));
app.use('/content', express.static(path.join(__dirname, 'public/content')));
// app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('传入非法JSON格式');
    return res.status(400) // Bad request
  }
  next();
});
app.use('/api/admin', adminRouter);

app.use(history({
  index: '/admin/index.html'
}));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));


module.exports = app;
