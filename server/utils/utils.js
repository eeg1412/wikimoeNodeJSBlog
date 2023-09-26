const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.creatSha256Str = function (str) {
    const sha256 = crypto.createHash('sha256')
    sha256.update(str)
    return sha256.digest('hex')
}
exports.HMACSHA256 = (str, secret) => {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(str)
    return hmac.digest('hex')
}
exports.creatBcryptStr = function (str) {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(str, salt)
    return hash
}
exports.checkBcryptStr = function (str, hash) {
    return bcrypt.compareSync(str, hash)
}

exports.creatJWT = function (payload, exp) {
    const secret = process.env.JWT_SECRET
    const token = jwt.sign(payload, secret, { expiresIn: exp })
    return token
}
exports.checkJWT = function (token) {
    const secret = process.env.JWT_SECRET
    let result = null
    try {
        const decoded = jwt.verify(token, secret)
        result = {
            isError: false,
            data: decoded,
        }
        return result
    } catch (err) {
        // {"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2022-03-03T02:36:11.000Z"}
        // {"name":"JsonWebTokenError","message":"invalid token"}
        result = {
            isError: true,
            errorData: { ...err },
        }
        return result
    }
}


exports.md5hex = (str /*: string */) => {
    const md5 = crypto.createHash('md5')
    return md5.update(str, 'utf8').digest('hex').toLowerCase()
}

exports.parseBase64 = (base64) => {
    if (!base64) {
        return null
    }
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (matches.length !== 3) {
        return null
    }
    return {
        type: matches[1],
        data: matches[2],
        extension: matches[1].split('/')[1] || 'jpg',
    }
}
