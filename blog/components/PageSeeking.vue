<template>
  <div class="container dark:opacity-80">
    <div class="title bg-primary text-white dark:text-black">程序员求签</div>
    <div class="info">
      <strong>求</strong>婚丧嫁娶亲友疾病编程测试升职跳槽陨石核弹各类吉凶
    </div>
    <div class="date"></div>
    <div class="check_luck">
      <ul>
        <li>编码测试修复提交之前求一签，可避凶趋吉</li>
        <li>选择所求之事并在心中默念，再单击“求”即可</li>
        <li>同一件事只能求一次，下次再求请刷新页面</li>
      </ul>
      <table class="event_table selecttable">
        <tbody>
          <tr>
            <td
              v-for="(item, index) in items"
              :key="index"
              :class="item.class"
              :data-event="item.event"
              @click="eventClik(item)"
            >
              {{ item.text }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="roll">
      <div class="card" style="top: -1px; font-size: 20pt">请点击所求之事</div>
      <transition name="slide">
        <div class="card clickable" v-if="showQiu" @click="startSeeking">
          <div class="title">求</div>
        </div>
      </transition>
      <!-- cardList -->
      <TransitionGroup name="slide">
        <div
          class="card"
          v-for="(item, index) in cardList"
          :key="index + '_' + item.title"
        >
          <div class="title dark:bg-gray-700/80">{{ item.title }}</div>
          <div class="desc">{{ item.desc }}</div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup>
//
/*
 * 注意：本程序中的“随机”都是伪随机概念。
 * 第一个种子相对固定，第二个种子相对有更多变化
 */
function random(seed1, seed2) {
  var n = seed1 % 11117
  for (var i = 0; i < 100 + seed2; i++) {
    n = n * n
    n = n % 11117 // 11117 是个质数
  }
  return n
}

const items = ref([
  { class: '', event: '100', text: '编码' },
  { class: '', event: '200', text: '测试' },
  { class: '', event: '300', text: '修复BUG' },
  { class: '', event: '400', text: '提交代码' },
  { class: '', event: '500', text: '其他' },
])

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

var weeks = ['日', '一', '二', '三', '四', '五', '六']
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

var today = new Date()
var timeseed = today.getMilliseconds()

/////////////////////////////////////////////////////////

var results = [
  '超大吉',
  '大吉',
  '吉',
  '小吉',
  ' ',
  '小凶',
  '凶',
  '大凶',
  '超大凶',
]
var descriptions = ['', '', '', '', '', '', '', '', '']
var luck_rate = [10, 100, 500, 800, 300, 800, 500, 100, 10] // 吉凶概率分布，总数为 3120

function pickRandomWithRate(seed1, seed2) {
  var result = random(seed1, seed2) % 3120
  var addup = 0

  for (var i = 0; i < luck_rate.length; i++) {
    addup += luck_rate[i]
    if (result <= addup) {
      return { title: results[i], desc: descriptions[i] }
    }
  }
  return { title: ' ', desc: '' }
}

/////////////////////////////////////////////////////////
var selectedEvent = null

const showQiu = ref(false)
const eventClik = (item) => {
  clearTimeout(slideTimer)
  // items
  items.value.forEach((element) => {
    element.class = ''
  })
  item.class = 'selected'
  selectedEvent = item.event
  showQiu.value = true
  cardList.value = []
}

function getNextCardText() {
  return pickRandomWithRate(timeseed + selectedEvent, slidecount)
}

var tail,
  slidecount = 0

const cardList = ref([])

const startSeeking = () => {
  slidecount = 0
  slide()
}

let slideTimer = null
function slide() {
  if (slidecount > 35) {
    return
  }

  var duration =
    slidecount > 33
      ? 1500
      : slidecount > 32
      ? 800
      : slidecount > 25
      ? 400
      : slidecount > 20
      ? 200
      : slidecount > 15
      ? 150
      : 100

  var cardInfo = getNextCardText()
  cardList.value.push(cardInfo)
  slidecount++
  slideTimer = setTimeout(slide, duration)
}

const titleDate = ref('')
onMounted(() => {
  titleDate.value = getTodayString()
  // initEventTable()
  // initClickEvent()
})
onUnmounted(() => {
  clearTimeout(slideTimer)
})
</script>
<style scoped>
.info {
  text-align: center;
  color: #dc143c;
  font-size: 14px;
}

.info strong {
  background: crimson;
  color: white;
  padding: 0 3px;
  margin: 0 1px;
}

.container > .title {
  font-weight: bold;
  margin-bottom: 10px;
  padding: 5px 15px;
}

.date {
  font-size: 17pt;
  font-weight: bold;
  line-height: 30pt;
  text-align: center;
  border-bottom: 1px solid #999;
}

.check_luck {
  padding-top: 10px;
}

.selecttable {
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
}

.selecttable td {
  text-align: center;
  padding: 10px 0;
  margin: 1px;
  background: #ccc;
  cursor: pointer;
  width: 20%;
  border-radius: 2px;
}

.selecttable td:hover {
  background: #aaa;
}

.selecttable td.selected {
  background: #333;
  color: #fff;
}

.roll {
  height: 200px;
  border: 1px solid #faa;
  margin-top: 10px;
  overflow: hidden;
  position: relative;
}

.card {
  @apply dark:bg-gray-600/80;
  background: #ffffff;
  text-align: center;
  line-height: 200px;
  border-top: 1px solid #faa;
  position: absolute;
  top: -1px;
  width: 100%;
}

.card .title {
  font-size: 70pt;
  font-weight: bold;
}

.card.clickable {
  background: crimson;
  color: #ffffff;
  cursor: pointer;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}
</style>
