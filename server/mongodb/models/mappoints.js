var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var mappoints = new Schema(
  {
    // 标题
    title: {
      type: String
    },
    // 简评
    summary: {
      type: String
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
