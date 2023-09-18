var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Schema
var users = new Schema({
  username: String,
  password: String,
  nickname: String,
  role: Number,
  photo: String,
  email: String,
  description: String,
  IP: String,
});

module.exports = mongoose.model('users', users);