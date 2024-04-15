var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var bangumis = new Schema({
  // 标题
  title: {
    type: String,
  },
  // 封面
  cover: {
    type: String,
  },
  coverFolder: {
    type: String,
    default: null
  },
  coverFileName: {
    type: String,
    default: null
  },
  // 简评
  summary: {
    type: String,
  },
  // 评分，神作，佳作，良作，劣作，烂作，迷
  rating: {
    type: Number,
  },
  // 年份
  year: {
    type: Number,
  },
  // 季度
  season: {
    type: Number,
  },
  // 弃坑
  giveUp: {
    type: Boolean,
    default: false
  },
  urlList: {
    type: [
      {
        text: String,
        url: String
      }
    ],
    default: []
  },
  // label 字符串数组
  label: {
    type: [String],
    default: []
  },
  // 状态 0: 不显示 1: 显示
  status: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('bangumis', bangumis);