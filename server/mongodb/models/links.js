var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var links = new Schema({
  icon: {
    type: String,
  },
  // 链接名称
  sitename: {
    type: String,
  },
  // 链接地址
  siteurl: {
    type: String,
  },
  // rss
  rss: {
    type: String,
  },
  // description
  description: {
    type: String,
  },
  // status 0 不显示 1 显示
  status: {
    type: Number,
    default: 0
  },
  // taxis 排序
  taxis: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('links', links);