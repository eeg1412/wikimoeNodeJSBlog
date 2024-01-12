
const postUtils = require('../../../mongodb/utils/posts')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  res.send({
  })
  const uuid = req.headers['x-request-id']
  const referrer = utils.setReferrer(req.body.referrer)
  const ip = utils.getUserIp(req)
  const action = req.body.action
  const actionList = ['open', 'postList', 'postListArchive', 'postListKeyword', 'postListSort', 'postListTag']
  let id = null
  let target = null
  let content = ''
  // 判断action是否符合格式
  if (!actionList.includes(action)) {
    return
  }
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    return
  }
  switch (action) {
    case 'open':
      break;
    case 'postListArchive':
      const title = req.body.title
      // title 必须
      if (!title) {
        return
      }
      content = title
      break;
    case 'postListKeyword':
      const keyword = req.body.keyword
      // keyword 必须
      if (!keyword) {
        return
      }
      content = keyword
      break;
    case 'postListSort':
      id = req.body.sortid
      const sortname = req.body.sortname
      // sortname 必须
      if (!sortname) {
        return
      }
      content = sortname
      target = 'sort'
      break;
    case 'postListTag':
      id = req.body.tagid
      const tagname = req.body.tagname
      // tagname 必须
      if (!tagname) {
        return
      }
      content = tagname
      target = 'tag'
      break;

    default:
      break;
  }
  if (id) {
    // 判断id是否符合格式
    if (!utils.isObjectId(id)) {
      return
    }
  }
  // 控制content长度在20字，超过...
  if (content.length > 20) {
    content = content.substring(0, 20) + '...'
  }
  const readerlogParams = {
    uuid: uuid,
    action: action,
    data: {
      target: target,
      targetId: id,
      content: content,
    },
    ...utils.isSearchEngine(req),
    referrer: referrer,
    deviceInfo: utils.deviceUAInfoUtils(req),
    ipInfo: await utils.IP2LocationUtils(ip, null, null, false),
    ip: ip
  }
  readerlogUtils.save(readerlogParams).then((data) => {
    userApiLog.info(`post view log create success`)
  }).catch((err) => {
    userApiLog.error(`post view log create fail, ${JSON.stringify(err)}`)
  })

}
