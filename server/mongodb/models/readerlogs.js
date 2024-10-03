var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const PerformanceNavigationTimingSchema = new Schema({
  connectDuration: { type: Number, default: null },
  domComplete: { type: Number, default: null },
  domInteractive: { type: Number, default: null },
  domainLookupDuration: { type: Number, default: null },
  duration: { type: Number, default: null },
  loadEventDuration: { type: Number, default: null },
  redirectCount: { type: Number, default: null },
  entryType: { type: String, default: null },
  name: { type: String, default: null },
  type: { type: String, default: null },
}, { _id: false });

// Schema
var readerlogs = new Schema({
  // 操作者的uuid
  uuid: {
    type: String,
    required: true,
    index: true
  },
  // 操作了什么
  action: {
    type: String,
    required: true,
    index: true
  },
  referrer: {
    type: String,
    default: ''
  },
  isBot: {
    type: Boolean,
    default: false,
    index: true
  },
  botName: {
    type: String,
    default: ''
  },
  // data
  data: {
    // object
    target: {
      type: String,
      default: '',
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },
    content: {
      type: String,
      default: ''
    },
    performanceNavigationTiming: {
      type: PerformanceNavigationTimingSchema,
      default: null
    },
  },
  // ip
  ip: {
    type: String,
    index: true
  },
  ipInfo: {
    type: Object,
    default: {}
  },
  deviceInfo: {
    type: Object,
    default: {}
  },
  expireAt: {
    type: Date,
    expires: 31968000,
    default: Date.now,
    index: true
  }
}, { timestamps: true });
// timestamps:
// createdAt
// updatedAt
module.exports = mongoose.model('readerlogs', readerlogs);