var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var readerlogs = new Schema({
  // 操作者的uuid
  uuid: {
    type: String,
    required: true,
  },
  // 操作了什么
  action: {
    type: String,
    required: true,
  },

}, { capped: 15728640, timestamps: true });

module.exports = mongoose.model('readerlogs', readerlogs);