var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var mappoints = new Schema(
  {
    // 标题
    title: {
      type: String,
      required: true,
      index: true
    },
    // 简介
    summary: {
      type: String
    },
    // 经度
    longitude: {
      type: Number,
      required: true,
      index: true
    },
    // 纬度
    latitude: {
      type: Number,
      required: true,
      index: true
    },
    zIndex: {
      type: Number,
      default: 0,
      index: true
    },
    // 状态 0: 不显示 1: 显示
    status: {
      type: Number,
      default: 0,
      index: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('mappoints', mappoints)
