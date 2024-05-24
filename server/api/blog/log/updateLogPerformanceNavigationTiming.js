
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')

module.exports = async function (req, res, next) {
  res.send({
  })
  const uuid = req.headers['wmb-request-id']
  const action = req.body.action
  const actionList = ['open']
  const id = req.body.id
  if (!utils.isObjectId(id)) {
    return
  }
  // 判断action是否符合格式
  if (!actionList.includes(action)) {
    return
  }
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    return
  }
  let performanceNavigationTiming = null;
  const performanceNavigationTimingData = req.body.performanceNavigationTiming || null;
  if (performanceNavigationTimingData && typeof performanceNavigationTimingData === 'object') {
    if (utils.isSearchEngine(req).isBot) {
      return
    }
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

  if (!performanceNavigationTiming || !performanceNavigationTiming?.duration || performanceNavigationTiming?.duration <= 0) {
    return
  }

  const readerlogParams = {
    data: {
      performanceNavigationTiming: performanceNavigationTiming
    }
  }
  setTimeout(() => {
    const filters = {
      _id: id,
      uuid: uuid,
      action: action,
      createdAt: { $gt: new Date(new Date().setMinutes(new Date().getMinutes() - 2)) }
    }
    readerlogUtils.updateOne(filters, readerlogParams).then((data) => {
      // console.log(data)
      userApiLog.info(`post view log create success`)
    }).catch((err) => {
      userApiLog.error(`post view log create fail, ${logErrorToText(err)}`)
    })
  }, 1000)
}
