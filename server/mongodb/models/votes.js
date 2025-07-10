var mongoose = require('mongoose')
var Schema = mongoose.Schema

// 定义选项子Schema
var OptionSchema = new Schema({
  // 选项文本
  title: { type: String, required: true },
  // 该选项的票数
  votes: { type: Number, default: 0, index: true },
  // 排序
  sort: { type: Number, default: 0, index: true }
})

// Schema
var votes = new Schema(
  {
    // 标题
    title: { type: String, required: true },
    // 投票数
    votes: { type: Number, default: 0, index: true },
    // 选项
    options: [OptionSchema],
    // 最多可选择的选项数
    maxSelect: { type: Number, default: 1 },
    // 投票后才显示结果
    showResultAfter: { type: Boolean, default: false },
    endTime: { type: Date, default: null, index: true },
    // 状态 0 不显示 1 显示
    status: { type: Number, default: 0, index: true }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret.options && Array.isArray(ret.options)) {
          ret.options.sort((a, b) => a.sort - b.sort)
        }
        return ret
      }
    },
    toObject: {
      transform: function (doc, ret) {
        if (ret.options && Array.isArray(ret.options)) {
          ret.options.sort((a, b) => a.sort - b.sort)
        }
        return ret
      }
    }
  }
)

module.exports = mongoose.model('votes', votes)
