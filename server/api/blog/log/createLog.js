const postUtils = require('../../../mongodb/utils/posts')
const readerlogUtils = require('../../../mongodb/utils/readerlogs')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const userApiLog = log4js.getLogger('userApi')
const mongoose = require('mongoose')
const languageData = require('../../../utils/intl/language.json')
const regionData = require('../../../utils/intl/region.json')
const scriptData = require('../../../utils/intl/script.json')

module.exports = async function (req, res, next) {
  const logId = new mongoose.Types.ObjectId()
  res.send({
    id: logId
  })
  const uuid = req.headers['wmb-request-id']
  const referrer = utils.setReferrer(req.body.referrer)
  const ip = utils.getUserIp(req)
  const action = req.body.action
  const actionList = [
    'open',
    'postList',
    'postListArchive',
    'postListKeyword',
    'postListSort',
    'postListTag',
    'postListBangumi',
    'postListMovie',
    'postListBook',
    'postListGame',
    'postListMappoint'
  ]
  let id = null
  let target = null
  let content = ''
  let performanceNavigationTiming = null
  let extraInfo = undefined
  // 判断action是否符合格式
  if (!actionList.includes(action)) {
    return
  }
  // 判断uuid是否符合格式
  if (!utils.isUUID(uuid)) {
    return
  }

  const { siteLogIPBlockList } = global.$globalConfig.IPBlockSettings

  // 校验IP黑名单
  if (siteLogIPBlockList.has(ip)) {
    console.info(`log block by ip:${ip}`)
    return
  }

  // 根据ip或uuid， 查询 readerlogUtils.count 当天的数据量是否超过1000条
  const readerlogCount = await readerlogUtils.count({
    $or: [
      {
        uuid: uuid
      },
      {
        ip: ip
      }
    ],
    createdAt: {
      $gte: utils.getTodayStartTime(),
      $lte: utils.getTodayEndTime()
    }
  })
  if (readerlogCount >= 1000) {
    return
  }

  const searchEngineData = utils.isSearchEngine(req)
  switch (action) {
    case 'open':
      // 如果不是机器人
      if (!searchEngineData.isBot) {
        // 处理 performanceNavigationTiming
        const performanceNavigationTimingData =
          req.body.performanceNavigationTiming || null
        if (
          performanceNavigationTimingData &&
          typeof performanceNavigationTimingData === 'object' &&
          performanceNavigationTimingData?.duration > 0
        ) {
          performanceNavigationTiming = {}

          const keys = [
            'connectDuration',
            'domComplete',
            'domInteractive',
            'domainLookupDuration',
            'duration',
            'loadEventDuration',
            'redirectCount'
          ]
          const stringKeys = ['entryType', 'name', 'type']

          keys.forEach(key => {
            if (performanceNavigationTimingData.hasOwnProperty(key)) {
              const value = performanceNavigationTimingData[key]
              if (
                typeof value === 'number' &&
                !isNaN(value) &&
                value < 999999 &&
                value >= 0
              ) {
                performanceNavigationTiming[key] = value
              } else {
                performanceNavigationTiming[key] = null
              }
            }
          })

          stringKeys.forEach(key => {
            if (performanceNavigationTimingData.hasOwnProperty(key)) {
              const value = performanceNavigationTimingData[key]
              if (typeof value === 'string' && value.length < 200) {
                performanceNavigationTiming[key] = value
              } else {
                performanceNavigationTiming[key] = null
              }
            }
          })
        }

        extraInfo = {}
        // 如果存在时区和语言
        let timeZone = req.body.timeZone || null
        let bodyLanguage = req.body.language || null

        // 时区列表
        const timeZoneList = Intl.supportedValuesOf('timeZone')
        // 验证时区，先校验字符串是否存在，且字符串长度小于100，再校验值是否在列表中
        if (
          timeZone &&
          typeof timeZone === 'string' &&
          timeZone.length < 100 &&
          timeZoneList.includes(timeZone)
        ) {
          extraInfo.timeZone = timeZone
        }

        // 验证语言，先校验字符串是否存在，且字符串长度在2-29 之间，只能是横杠和大小写英文
        if (
          bodyLanguage &&
          typeof bodyLanguage === 'string' &&
          bodyLanguage.length >= 2 &&
          bodyLanguage.length <= 29 &&
          /^[a-zA-Z-]+$/.test(bodyLanguage)
        ) {
          try {
            const intlLocale = new Intl.Locale(bodyLanguage)
            let { language, region, script } = intlLocale

            // 用于匹配的版本（小写）
            const languageLower = language ? language.toLowerCase() : null
            const regionLower = region ? region.toLowerCase() : null
            const scriptLower = script ? script.toLowerCase() : null

            // 校验language: 必须有，长度2-3，且在language.json中
            let valid = true
            if (
              !languageLower ||
              languageLower.length < 2 ||
              languageLower.length > 3 ||
              !languageData[languageLower]
            ) {
              valid = false
            }
            // 校验region: 可有可无，存在时长度2-3，且在region.json中
            if (
              valid &&
              regionLower &&
              (regionLower.length < 2 ||
                regionLower.length > 3 ||
                !regionData[regionLower])
            ) {
              valid = false
            }
            // 校验script: 可有可无，存在时长度4，且在script.json中
            if (
              valid &&
              scriptLower &&
              (scriptLower.length !== 4 || !scriptData[scriptLower])
            ) {
              valid = false
            }

            if (valid) {
              extraInfo.language = { language, region, script }
            }
          } catch (e) {
            bodyLanguage = null
          }
        }

        // 如果 extraInfo 为空对象，设为 undefined
        if (Object.keys(extraInfo).length === 0) {
          extraInfo = undefined
        }
      }

      break
    case 'postListArchive':
      const title = req.body.title
      // title 必须
      if (!title) {
        return
      }
      target = 'archive'
      content = title
      break
    case 'postListKeyword':
      const keyword = req.body.keyword
      // keyword 必须
      if (!keyword) {
        return
      }
      content = keyword
      break
    case 'postListSort':
      id = req.body.sortid
      const sortname = req.body.sortname
      // sortname 必须
      if (!sortname) {
        return
      }
      content = sortname
      target = 'sort'
      break
    case 'postListTag':
      id = req.body.tagid
      const tagname = req.body.tagname
      // tagname 必须
      if (!tagname) {
        return
      }
      content = tagname
      target = 'tag'
      break
    case 'postListMappoint':
      id = req.body.mappointid
      const postListMappointTitle = req.body.title
      // title 必须
      if (!postListMappointTitle) {
        return
      }
      content = postListMappointTitle
      target = 'mappoint'
      break
    case 'postListBangumi':
      id = req.body.bangumiid
      const banguminame = req.body.banguminame
      // banguminame 必须
      if (!banguminame) {
        return
      }
      content = banguminame
      target = 'bangumi'
      break
    case 'postListMovie':
      id = req.body.movieid
      const moviename = req.body.moviename
      // moviename 必须
      if (!moviename) {
        return
      }
      content = moviename
      target = 'movie'
      break
    case 'postListBook':
      id = req.body.bookid
      const bookname = req.body.bookname
      // bookname 必须
      if (!bookname) {
        return
      }
      content = bookname
      target = 'book'
      break
    case 'postListGame':
      id = req.body.gameid
      const gamename = req.body.gamename
      // gamename 必须
      if (!gamename) {
        return
      }
      content = gamename
      target = 'game'
      break
    default:
      break
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

  if (extraInfo) {
    readerlogParams.data.extraInfo = extraInfo
  }

  readerlogUtils
    .save(readerlogParams)
    .then(data => {
      userApiLog.info(`post view log create success`)
    })
    .catch(err => {
      userApiLog.error(`post view log create fail, ${logErrorToText(err)}`)
    })
}
