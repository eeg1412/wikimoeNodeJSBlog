var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var users = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 1
  },
  photo: String,
  email: String,
  description: String,
  disabled: {
    type: Boolean,
    default: false
  },
  IP: String,
});

module.exports = mongoose.model('users', users);