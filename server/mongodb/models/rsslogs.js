var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var rsslogs = new Schema(
  {
    ip: {
      type: String,
    },
    ipInfo: {
      type: Object,
      default: {},
    },
    deviceInfo: {
      type: Object,
      default: {},
    },
    rssPath: {
      type: String,
      default: '',
    },
    reader: {
      type: String,
      default: '',
    },
  },
  { capped: 15728640, timestamps: true },
)

module.exports = mongoose.model('rsslogs', rsslogs)
