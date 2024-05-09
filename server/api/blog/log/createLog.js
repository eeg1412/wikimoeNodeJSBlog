
const postUtils = require('../../../mongodb/utils/posts')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const mongoose = require('mongoose');

module.exports = async function (req, res, next) {
  const logId = new mongoose.Types.ObjectId();
  res.send({
    id: logId
  })
  const uuid = req.headers['x-request-id']
  const referrer = utils.setReferrer(req.body.referrer)
  const ip = utils.getUserIp(req)
  const action = req.body.action
  const actionList = ['open', 'postList', 'postListArchive', 'postListKeyword', 'postListSort', 'postListTag']
  let id = null
  let target = null
  let content = ''
  let performanceNavigationTiming = null
  // 判断action是否符合格式
  if (!actionList.includes(action)) {
    return
  }
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    return
  }
  const searchEngineData = utils.isSearchEngine(req)
  switch (action) {
    case 'open':
      const performanceNavigationTimingData = req.body.performanceNavigationTiming || null;
      if (!searchEngineData.isBot && performanceNavigationTimingData && typeof performanceNavigationTimingData === 'object') {
        performanceNavigationTiming = {};

        const keys = ['connectDuration', 'domComplete', 'domInteractive', 'domainLookupDuration', 'duration', 'loadEventDuration', 'redirectCount'];
        const stringKeys = ['entryType', 'name', 'type'];

        keys.forEach(key => {
          if (performanceNavigationTimingData.hasOwnProperty(key)) {
            const value = performanceNavigationTimingData[key];
            if (typeof value === 'number' && !isNaN(value) && value < 999999) {
              performanceNavigationTiming[key] = value;
            } else {
              performanceNavigationTiming[key] = null;
            }
          }
        });

        stringKeys.forEach(key => {
          if (performanceNavigationTimingData.hasOwnProperty(key)) {
            const value = performanceNavigationTimingData[key];
            if (typeof value === 'string' && value.length < 200) {
              performanceNavigationTiming[key] = value;
            } else {
              performanceNavigationTiming[key] = null;
            }
          }
        });
      }
      break;
    case 'postListArchive':
      const title = req.body.title
      // title 必须
      if (!title) {
        return
      }
      target = 'archive'
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
    _id: logId,
    uuid: uuid,
    action: action,
    data: {
      target: target,
      targetId: id,
      content: content,
      performanceNavigationTiming: performanceNavigationTiming
    },
    ...searchEngineData,
    referrer: referrer,
    deviceInfo: utils.deviceUAInfoUtils(req),
    ipInfo: await utils.IP2LocationUtils(ip, null, null, false),
    ip: ip
  }
  readerlogUtils.save(readerlogParams).then((data) => {
    userApiLog.info(`post view log create success`)
  }).catch((err) => {
    userApiLog.error(`post view log create fail, ${logErrorToText(err)}`)
  })

}
