<template>
  <div class="container dark:opacity-80">
    <div class="title bg-primary text-white dark:text-black">
      {{ t('almanac.title') }}
    </div>
    <div class="date">{{ isLoading ? t('almanac.loading') : titleDate }}</div>
    <div class="good">
      <div class="title">
        <table>
          <tbody>
            <tr>
              <td class="dark:text-black">{{ t('almanac.goodTitle') }}</td>
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
              <td class="dark:text-white">{{ t('almanac.badTitle') }}</td>
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
      <strong>{{ t('almanac.seatDirectionLabel') }}</strong
      >{{ seatDirectionParts.before
      }}<span class="direction_value">{{ direction_value }}</span
      >{{ seatDirectionParts.after }}
    </div>
    <div class="line-tip">
      <strong>{{ t('almanac.drinkLabel') }}</strong
      ><span class="drink_value">{{ drink_value }}</span>
    </div>
    <div class="line-tip">
      <strong>{{ t('almanac.goddessLabel') }}</strong
      ><span class="goddes_value">{{ goddes_value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getLanguageTextMap } from '@/lang'

const { languageCode, t } = useLang()
const almanacText = computed(
  () => getLanguageTextMap(languageCode.value).almanac
)
const seatDirectionParts = computed(() => {
  const [before = '', after = ''] = t('almanac.seatDirectionText', {
    direction: '__DIRECTION__'
  }).split('__DIRECTION__')

  return { before, after }
})

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

const getCurrentAlmanac = () => almanacText.value

function getTodayString() {
  return t('almanac.todayText', {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    week: getCurrentAlmanac().weeks[today.getDay()]
  })
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
  var _activities = filter(getCurrentAlmanac().activities)

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
  var specials = getCurrentAlmanac().specials

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
  var varNames = getCurrentAlmanac().varNames
  var tools = getCurrentAlmanac().tools

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
const isLoading = ref(true)
const titleDate = ref('')
const direction_value = ref('')
const drink_value = ref('')
const goddes_value = ref('')
const init = () => {
  goodList.value = []
  badList.value = []

  titleDate.value = getTodayString()
  direction_value.value =
    getCurrentAlmanac().directions[
      random(iday, 2) % getCurrentAlmanac().directions.length
    ]
  drink_value.value = pickRandom(getCurrentAlmanac().drinks, 2).join(
    getCurrentAlmanac().drinkSeparator
  )
  goddes_value.value = star((random(iday, 6) % 5) + 1)
  pickTodaysLuck()
  isLoading.value = false
}
onMounted(() => {
  init()
})

watch(
  () => languageCode.value,
  () => {
    init()
  }
)
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
  min-height: 68px;
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
