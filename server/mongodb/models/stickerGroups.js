var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var stickerGroups = new Schema(
  {
    // 名字
    name: {
      type: String,
      required: true
    },
    // 排序
    taxis: {
      type: Number,
      default: 0,
      index: true
    },
    // 是否显示 0: 不显示 1: 显示
    status: {
      type: Number,
      default: 0,
      index: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('stickerGroups', stickerGroups)
