var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var events = new Schema(
  {
    eventtype: {
      type: Schema.Types.ObjectId,
      ref: 'eventtypes',
      required: true,
      index: true,
    },
    // 标题
    title: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: null,
    },
    urlList: {
      type: [
        {
          text: String,
          url: String,
        },
      ],
      default: [],
    },
    content: {
      type: String,
      default: '',
    },
    // 开始时间
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    // 结束时间
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    // 状态 0: 不显示 1: 显示
    status: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('events', events)
