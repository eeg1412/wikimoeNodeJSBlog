var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var options = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  // value
  value: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('options', options);