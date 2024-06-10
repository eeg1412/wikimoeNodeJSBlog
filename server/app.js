global.$cacheData = {}
var express = require('express');
const log4js = require('log4js')
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
const $mongodDB = require('./mongodb')
global.$mongodDB = $mongodDB
var history = require('connect-history-api-fallback');

var adminRouter = require('./routes/admin');
const blogRouter = require('./routes/blog');
const rssRouter = require('./routes/rss/index');
const utils = require('./utils/utils')
const fs = require('fs')

// 如果cache文件夹不存在，创建cache文件夹
const cacheFolder = './cache'
if (!fs.existsSync(cacheFolder)) {
  console.info('cache文件夹不存在，创建cache文件夹')
  fs.mkdirSync(cacheFolder)
}
// 如果rss文件夹不存在，创建rss文件夹
const rssFolder = './cache/rss'
if (!fs.existsSync(rssFolder)) {
  console.info('rss文件夹不存在，创建rss文件夹')
  fs.mkdirSync(rssFolder)
}

var app = express();

app.use(log4js.connectLogger(log4js.getLogger('access'), { level: 'auto' }))

// app.use(logger('dev'));
app.use(express.json({ limit: process.env.JSON_LIMT || '10mb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.URLENCODED_LIMT || '10mb' }));
app.use(cookieParser());

const upLoadFolder = path.join(__dirname, 'public/upload')
app.use('/upload', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(upLoadFolder, { maxAge: '365d' }));

const contentFolder = path.join(__dirname, 'public/content')
app.use('/content', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(contentFolder, { maxAge: '365d' }));

// up_works referrerRecord
const upWorksFolder = path.join(__dirname, 'public/up_works')
app.use('/up_works', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(upWorksFolder, { maxAge: '365d' }));

// web_demo referrerRecord
const webDemoFolder = path.join(__dirname, 'public/web_demo')
app.use('/web_demo', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(webDemoFolder, { maxAge: '365d' }));

// ucloudImg referrerRecord
const ucloudImgFolder = path.join(__dirname, 'public/ucloudImg')
app.use('/ucloudImg', function (req, res, next) {
  utils.referrerRecord(req.headers.referer, 'assets')
  next();
}, express.static(ucloudImgFolder, { maxAge: '365d' }));
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
// robots.txt
app.use('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});
// 所有第一级路径不是/admin的，都返回404
app.use((req, res, next) => {
  const firstLevelPath = req.path.split('/')[1];
  if (firstLevelPath !== 'admin') {
    res.status(404).send('Not found');
  } else {
    next();
  }
});
app.use(history({
  index: '/admin/index.html'
}));
app.use('/admin', express.static(path.join(__dirname, 'front/admin')));

// setInterval(() => {
//   const memoryUsage = process.memoryUsage();
//   const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2);
//   const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
//   const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
//   console.log(`RSS: ${rss} MB, Heap Total: ${heapTotal} MB, Heap Used: ${heapUsed} MB`);
// }, 1000);

module.exports = app;
