global.$cacheData = {}
var express = require('express');
const log4js = require('log4js')
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
require('./mongodb')
var history = require('connect-history-api-fallback');

var adminRouter = require('./routes/admin');
const blogRouter = require('./routes/blog');
const rssRouter = require('./routes/rss/index');
const utils = require('./utils/utils')

var app = express();

app.use(log4js.connectLogger(log4js.getLogger('access'), { level: 'auto' }))

// app.use(logger('dev'));
app.use(express.json({ limit: process.env.JSON_LIMT || '10mb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.URLENCODED_LIMT || '10mb' }));
app.use(cookieParser());
app.use('/upload', express.static(path.join(__dirname, 'public/upload')));
app.use('/content', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(path.join(__dirname, 'public/content')));
// up_works referrerRecord
app.use('/up_works', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(path.join(__dirname, 'public/up_works')));
// web_demo referrerRecord
app.use('/web_demo', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(path.join(__dirname, 'public/web_demo')));
// app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('传入非法JSON格式');
    return res.status(400) // Bad request
  }
  next();
});
app.use('/api/admin', adminRouter);
app.use('/api/blog', blogRouter);
app.use('/rss', rssRouter);

app.use(history({
  index: '/admin/index.html'
}));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));


module.exports = app;
