const reactionEmojis = require('../../../config/reactionEmojis')

module.exports = async function (req, res, next) {
  res.send({
    list: reactionEmojis
  })
}
