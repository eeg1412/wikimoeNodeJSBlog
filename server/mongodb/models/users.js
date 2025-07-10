var mongoose = require('mongoose')
var Schema = mongoose.Schema
// Schema
var users = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      default: 1,
      index: true,
    },
    photo: String,
    email: String,
    description: String,
    cover: { type: Schema.ObjectId, ref: 'attachments', default: null },
    disabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    pwversion: {
      type: Number,
      default: 0,
      index: true,
    },
    IP: String,
    ipInfo: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('users', users)
