var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var rsslogs = new Schema({
  ip: {
    type: String,
  },
  ipInfo: {
    type: Object,
    default: {}
  },
  deviceInfo: {
    type: Object,
    default: {}
  },
  rssPath: {
    type: String,
    default: ''
  },
  reader: {
    type: String,
    default: ''
  },
  expireAt: { type: Date, expires: 31968000, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('rsslogs', rsslogs);