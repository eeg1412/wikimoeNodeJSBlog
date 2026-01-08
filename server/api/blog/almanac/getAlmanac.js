const almanacUtils = require('../../../mongodb/utils/almanacs')
const log4js = require('log4js')
const blogApiLog = log4js.getLogger('blogApi')

/*
 * 注意：本程序中的"随机"都是伪随机概念，以当前的天为种子。
 */
function random(dayseed, indexseed) {
  var n = dayseed % 11117
  for (var i = 0; i < 100 + indexseed; i++) {
    n = n * n
    n = n % 11117 // 11117 是个质数
  }
  return n
}

var tools = [
  'Eclipse写程序',
  'MSOffice写文档',
  '记事本写程序',
  'Windows8',
  'Linux',
  'MacOS',
  'IE',
  'Android设备',
  'iOS设备'
]

var varNames = [
  'jieguo',
  'huodong',
  'pay',
  'expire',
  'zhangdan',
  'every',
  'free',
  'i1',
  'a',
  'virtual',
  'ad',
  'spider',
  'mima',
  'pass',
  'ui'
]

var drinks = [
  '水',
  '茶',
  '红茶',
  '绿茶',
  '咖啡',
  '奶茶',
  '可乐',
  '鲜奶',
  '豆奶',
  '果汁',
  '果味汽水',
  '苏打水',
  '运动饮料',
  '酸奶',
  '酒'
]

var directions = [
  '北方',
  '东北方',
  '东方',
  '东南方',
  '南方',
  '西南方',
  '西方',
  '西北方'
]

// 解析占位符并替换成随机内容
function parse(event, iday) {
  var result = { name: event.name, good: event.good, bad: event.bad } // clone

  if (result.name.indexOf('%v') != -1) {
    result.name = result.name.replace(
      '%v',
      varNames[random(iday, 12) % varNames.length]
    )
  }

  if (result.name.indexOf('%t') != -1) {
    result.name = result.name.replace(
      '%t',
      tools[random(iday, 11) % tools.length]
    )
  }

  if (result.name.indexOf('%l') != -1) {
    result.name = result.name.replace(
      '%l',
      ((random(iday, 12) % 247) + 30).toString()
    )
  }

  return result
}

// 从数组中随机挑选 size 个
function pickRandom(array, size, iday) {
  var result = []

  for (var i = 0; i < array.length; i++) {
    result.push(array[i])
  }

  for (var j = 0; j < array.length - size; j++) {
    var index = random(iday, j) % result.length
    result.splice(index, 1)
  }

  return result
}

function star(num) {
  var result = ''
  var i = 0
  while (i < num) {
    result += '★'
    i++
  }
  while (i < 5) {
    result += '☆'
    i++
  }
  return result
}

module.exports = async function (req, res, next) {
  const { timezone } = req.query
  
  // 使用用户的时区或默认使用UTC+8
  const timezoneOffset = timezone ? parseInt(timezone) : 8
  
  // 获取当前UTC时间
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  
  // 计算用户时区的时间
  const userTime = new Date(utc + 3600000 * timezoneOffset)
  const iday =
    userTime.getFullYear() * 10000 +
    (userTime.getMonth() + 1) * 100 +
    userTime.getDate()
  
  const isWeekend = userTime.getDay() == 0 || userTime.getDay() == 6

  try {
    // 查询所有可见的老黄历项目
    const query = { status: 1 }
    const sort = { taxis: 1, _id: -1 }
    
    let activities = await almanacUtils.find(query, sort, null, { lean: true })
    
    // 过滤出有效的项目
    activities = activities.filter(activity => {
      // 检查生效日期
      if (activity.effectiveDate !== null && activity.effectiveDate !== iday) {
        return false
      }
      // 周末过滤
      if (isWeekend && !activity.weekend) {
        return false
      }
      if (!isWeekend && activity.weekend) {
        return false
      }
      return true
    })

    // 随机选择宜和不宜的数量
    const numGood = (random(iday, 98) % 3) + 2
    const numBad = (random(iday, 87) % 3) + 2
    const totalNeeded = numGood + numBad

    // 从可用活动中随机挑选
    const pickedActivities = pickRandom(activities, Math.min(totalNeeded, activities.length), iday)
    
    // 解析占位符
    const parsedActivities = pickedActivities.map(activity => parse(activity, iday))

    // 分配到宜和不宜
    const goodList = []
    const badList = []
    
    for (let i = 0; i < Math.min(numGood, parsedActivities.length); i++) {
      goodList.push(parsedActivities[i])
    }
    
    for (let i = numGood; i < parsedActivities.length; i++) {
      badList.push(parsedActivities[i])
    }

    // 生成其他信息
    const weeks = ['日', '一', '二', '三', '四', '五', '六']
    const titleDate = `今天是${userTime.getFullYear()}年${userTime.getMonth() + 1}月${userTime.getDate()}日 星期${weeks[userTime.getDay()]}`
    const direction_value = directions[random(iday, 2) % directions.length]
    const drink_value = pickRandom(drinks, 2, iday).join('，')
    const goddes_value = star((random(iday, 6) % 5) + 1)

    res.send({
      data: {
        titleDate,
        goodList,
        badList,
        direction_value,
        drink_value,
        goddes_value
      }
    })
  } catch (err) {
    blogApiLog.error(`almanac get fail, ${JSON.stringify(err)}`)
    res.status(400).json({
      errors: [
        {
          message: '老黄历获取失败'
        }
      ]
    })
  }
}
