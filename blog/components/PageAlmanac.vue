<template>
  <div class="container">
    <div class="title bg-primary text-white">程序员老黄历</div>
    <div class="date">{{ titleDate }}</div>
    <div class="good">
      <div class="title">
        <table>
          <tbody>
            <tr>
              <td>宜</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="content">
        <ul>
          <li v-for="(item, index) in goodList" :key="index">
            <div class="name">{{ item.name }}</div>
            <div class="description">{{ item.good }}</div>
          </li>
        </ul>
      </div>
      <div class="clear"></div>
    </div>
    <div class="split"></div>
    <div class="bad">
      <div class="title">
        <table>
          <tbody>
            <tr>
              <td>不宜</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="content">
        <ul>
          <li v-for="(item, index) in badList" :key="index">
            <div class="name">{{ item.name }}</div>
            <div class="description">{{ item.bad }}</div>
          </li>
        </ul>
      </div>
      <div class="clear"></div>
    </div>
    <div class="split"></div>
    <div class="line-tip">
      <strong>座位朝向：</strong>面向<span class="direction_value">{{
        direction_value
      }}</span
      >写程序，BUG 最少。
    </div>
    <div class="line-tip">
      <strong>今日宜饮：</strong
      ><span class="drink_value">{{ drink_value }}</span>
    </div>
    <div class="line-tip">
      <strong>女神亲近指数：</strong
      ><span class="goddes_value">{{ goddes_value }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/*
 * 注意：本程序中的“随机”都是伪随机概念，以当前的天为种子。
 */
function random(dayseed, indexseed) {
  var n = dayseed % 11117
  for (var i = 0; i < 100 + indexseed; i++) {
    n = n * n
    n = n % 11117 // 11117 是个质数
  }
  return n
}

var today = new Date()
var iday =
  today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

var weeks = ['日', '一', '二', '三', '四', '五', '六']
var directions = [
  '北方',
  '东北方',
  '东方',
  '东南方',
  '南方',
  '西南方',
  '西方',
  '西北方',
]
var activities = [
  {
    name: '写单元测试',
    good: '写单元测试将减少出错',
    bad: '写单元测试会降低你的开发效率',
  },
  {
    name: '洗澡',
    good: '你几天没洗澡了？',
    bad: '会把设计方面的灵感洗掉',
    weekend: true,
  },
  {
    name: '锻炼一下身体',
    good: '是时候舒展下僵硬的肌肉了',
    bad: '能量没消耗多少，吃得却更多',
    weekend: true,
  },
  {
    name: '抽烟',
    good: '抽烟有利于提神，增加思维敏捷，但吸烟仍然有害健康',
    bad: '吸烟有害健康',
    weekend: true,
  },
  { name: '白天上线', good: '今天白天上线是安全的', bad: '可能导致灾难性后果' },
  { name: '重构', good: '代码质量得到提高', bad: '你很有可能会陷入泥潭' },
  { name: '使用%t', good: '你看起来更有品位', bad: '别人会觉得你在装逼' },
  {
    name: '跳槽',
    good: '该放手时就放手',
    bad: '鉴于当前的经济形势，你的下一份工作未必比现在强',
  },
  { name: '招人', good: '你面前这位有成为牛人的潜质', bad: '这人会写程序吗？' },
  { name: '面试', good: '面试官今天心情很好', bad: '面试官不爽，会拿你出气' },
  {
    name: '提交辞职申请',
    good: '公司找到了一个比你更能干更便宜的家伙，巴不得你赶快滚蛋',
    bad: '鉴于当前的经济形势，你的下一份工作未必比现在强',
  },
  { name: '申请加薪', good: '老板今天心情很好', bad: '公司正在考虑裁员' },
  {
    name: '晚上加班',
    good: '晚上是程序员精神最好的时候',
    bad: '身心憔悴，早点休息',
    weekend: true,
  },
  {
    name: '在妹子面前吹牛',
    good: '改善你矮穷挫的形象',
    bad: '会被识破',
    weekend: true,
  },
  {
    name: '在维基萌抽卡',
    good: '大概率抽到了自己心仪的卡',
    bad: '垃圾卡片满天飞',
    weekend: true,
  },
  {
    name: '写技术文章',
    good: '新的水文即将诞生',
    bad: '你的博文会被抄袭',
    weekend: true,
  },
  { name: '命名变量"%v"', good: '变量名萌萌哒', bad: '这个变了永远引用不到' },
  {
    name: '写超过%l行的方法',
    good: '你的代码组织的很好，长一点没关系',
    bad: '你的代码将混乱不堪，你自己都看不懂',
  },
  {
    name: '提交代码',
    good: '遇到冲突的几率是最低的',
    bad: '你遇到的一大堆冲突会让你觉得自己是不是时间穿越了',
  },
  {
    name: '代码复审',
    good: '发现重要问题的几率大大增加',
    bad: '你什么问题都发现不了，白白浪费时间',
  },
  {
    name: '开会',
    good: '写代码之余放松一下打个盹，有益健康',
    bad: '小心被扣屎盆子背黑锅',
  },
  {
    name: '打守望先锋',
    good: '你将有如神助',
    bad: '你会被虐的很惨',
    weekend: true,
  },
  {
    name: '晚上上线',
    good: '晚上是程序员精神最好的时候',
    bad: '你白天已经筋疲力尽了',
  },
  {
    name: '修复BUG',
    good: '你今天对BUG的嗅觉大大提高',
    bad: '新产生的BUG将比修复的更多',
  },
  {
    name: '设计评审',
    good: '设计评审会议将变成头脑风暴',
    bad: '人人筋疲力尽，评审就这么过了',
  },
  {
    name: '需求评审',
    good: '这个需求很简单',
    bad: '公司需要一个能根据手机外壳变化APP皮肤的功能',
  },
  {
    name: '上博客',
    good: '今天发生的事不能错过',
    bad: '今天的博客充满负能量',
    weekend: true,
  },
  {
    name: '上AB站',
    good: '还需要理由吗？',
    bad: '发现弹幕评论都是键盘侠',
    weekend: true,
  },
  {
    name: '玩冒险岛Online',
    good: '砸出二十五星神装',
    bad: '除非你想把电脑砸了',
    weekend: true,
  },
]

var specials = [
  {
    date: 20140214,
    type: 'bad',
    name: '待在男（女）友身边',
    description: '脱团火葬场，入团保平安。',
  },
]

var tools = [
  'Eclipse写程序',
  'MSOffice写文档',
  '记事本写程序',
  'Windows8',
  'Linux',
  'MacOS',
  'IE',
  'Android设备',
  'iOS设备',
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
  'ui',
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
  '酒',
]

function getTodayString() {
  return (
    '今天是' +
    today.getFullYear() +
    '年' +
    (today.getMonth() + 1) +
    '月' +
    today.getDate() +
    '日 星期' +
    weeks[today.getDay()]
  )
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

// 生成今日运势
function pickTodaysLuck() {
  var _activities = filter(activities)

  var numGood = (random(iday, 98) % 3) + 2
  var numBad = (random(iday, 87) % 3) + 2
  var eventArr = pickRandomActivity(_activities, numGood + numBad)

  var specialSize = pickSpecials()

  for (var i = 0; i < numGood; i++) {
    addToGood(eventArr[i])
  }

  for (var i = 0; i < numBad; i++) {
    addToBad(eventArr[numGood + i])
  }
}

// 去掉一些不合今日的事件
function filter(activities) {
  var result = []

  // 周末的话，只留下 weekend = true 的事件
  if (isWeekend()) {
    for (var i = 0; i < activities.length; i++) {
      if (activities[i].weekend) {
        result.push(activities[i])
      }
    }

    return result
  }

  return activities
}

function isWeekend() {
  return today.getDay() == 0 || today.getDay() == 6
}

// 添加预定义事件
function pickSpecials() {
  var specialSize = [0, 0]

  for (var i = 0; i < specials.length; i++) {
    var special = specials[i]

    if (iday == special.date) {
      if (special.type == 'good') {
        specialSize[0]++
        addToGood({ name: special.name, good: special.description })
      } else {
        specialSize[1]++
        addToBad({ name: special.name, bad: special.description })
      }
    }
  }

  return specialSize
}

// 从 activities 中随机挑选 size 个
function pickRandomActivity(activities, size) {
  var picked_events = pickRandom(activities, size)

  for (var i = 0; i < picked_events.length; i++) {
    picked_events[i] = parse(picked_events[i])
  }

  return picked_events
}

// 从数组中随机挑选 size 个
function pickRandom(array, size) {
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

// 解析占位符并替换成随机内容
function parse(event) {
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

// 添加到“宜”
const goodList = ref([])
function addToGood(event) {
  goodList.value.push(event)
}

// 添加到“不宜”
const badList = ref([])
function addToBad(event) {
  badList.value.push(event)
}

const titleDate = ref('')
const direction_value = ref('')
const drink_value = ref('')
const goddes_value = ref('')
onMounted(() => {
  titleDate.value = getTodayString()
  direction_value.value = directions[random(iday, 2) % directions.length]
  drink_value.value = pickRandom(drinks, 2).join('，')
  goddes_value.value = star((random(iday, 6) % 5) + 1)
  pickTodaysLuck()
})
</script>

<style scoped>
.container > .title {
  font-weight: bold;
  margin-bottom: 10px;
  padding: 5px 15px;
}

.adlink {
  text-align: center;
  font-size: 11pt;
}

.adlink a {
  text-decoration: none;
  display: block;
  color: #666;
  font-weight: bold;
  margin-bottom: 10px;
  background: #eee;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10pt;
  margin-top: 10pt;
}

.date {
  font-size: 17pt;
  font-weight: bold;
  line-height: 30pt;
  text-align: center;
}

.split,
.clear {
  clear: both;
  height: 1px;
  overflow-y: hidden;
}

.good,
.bad {
  clear: both;
  position: relative;
}

.good .title,
.bad .title {
  float: left;
  width: 100px;
  font-weight: bold;
  text-align: center;
  font-size: 30pt;
  position: absolute;
  top: 0;
  bottom: 0;
}

.good .title > table,
.bad .title > table {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
}

.good .title {
  background: #ffee44;
}

.someday .good .title {
  background: #aaaaaa;
}

.bad .title {
  background: #ff4444;
  color: #fff;
}

.someday .bad .title {
  background: #666666;
  color: #fff;
}

.good .content,
.bad .content {
  margin-left: 115px;
  padding-right: 10px;
  padding-top: 1px;
  font-size: 15pt;
}

.someday .good {
  background: #dddddd;
}

.someday .bad {
  background: #aaaaaa;
}

.good {
  background: #ffffaa;
}

.bad {
  background: #ffddd3;
}

.content ul {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
}

.content ul li {
  line-height: 150%;
  font-size: 15pt;
  font-weight: bold;
  color: #444;
}

.content ul li div.description {
  font-size: 11pt;
  font-weight: normal;
  color: #777;
  line-height: 110%;
  margin-bottom: 10px;
}

.line-tip {
  font-size: 11pt;
  margin-top: 10px;
  margin-left: 10px;
}

.direction_value {
  color: #4a4;
  font-weight: bold;
}

.someday .direction_value {
  color: #888;
}

.goddes_value {
  color: #f87;
}

.someday .goddes_value {
  color: #777;
}

.comment {
  margin-top: 50px;
  font-size: 11pt;
  margin-left: 10px;
}

.comment ul {
  margin-left: 0;
  padding-left: 20px;
  color: #999;
}
</style>
