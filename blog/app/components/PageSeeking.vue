<template>
  <div class="container dark:opacity-80">
    <div class="title bg-primary text-white dark:text-black">
      {{ t('seeking.title') }}
    </div>
    <div class="info">
      <strong>{{ t('seeking.summaryPrefix') }}</strong
      >{{ t('seeking.summary') }}
    </div>
    <div class="date">{{ titleDate }}</div>
    <div class="check_luck">
      <ul>
        <li
          v-for="(instruction, index) in seekingText.instructions"
          :key="index"
        >
          {{ instruction }}
        </li>
      </ul>
      <table class="event_table selecttable">
        <tbody>
          <tr>
            <td
              class="common-focus-visible-btn-outline"
              v-for="item in itemList"
              :key="index"
              :class="item.class"
              :data-event="item.event"
              @click="eventClick(item)"
              tabindex="0"
              @keydown.enter="eventClick(item)"
            >
              {{ item.text }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="roll">
      <div class="card" style="top: -1px; font-size: 20pt">
        {{ t('seeking.initialCard') }}
      </div>
      <transition name="slide">
        <div
          class="card clickable common-focus-visible-btn-outline"
          v-if="showQiu"
          @click="startSeeking"
          tabindex="0"
          @keydown.enter="startSeeking"
        >
          <div class="title">{{ t('seeking.actionText') }}</div>
        </div>
      </transition>
      <!-- cardList -->
      <TransitionGroup name="slide">
        <div
          class="card"
          v-for="(resultIndex, index) in cardResultIndexList"
          :key="`${index}_${resultIndex}`"
        >
          <div class="title dark:bg-gray-700/80">
            {{ resultList[resultIndex]?.title }}
          </div>
          <div class="desc">{{ resultList[resultIndex]?.desc }}</div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup>
import { getLanguageTextMap } from '@/lang'

/*
 * 注意：本程序中的“随机”都是伪随机概念。
 * 第一个种子相对固定，第二个种子相对有更多变化
 */
function random(seed1, seed2) {
  let n = seed1 % 11117
  for (let i = 0; i < 100 + seed2; i++) {
    n = n * n
    n = n % 11117 // 11117 是个质数
  }
  return n
}

const { languageCode, t } = useLang()

const seekingText = computed(
  () => getLanguageTextMap(languageCode.value).seeking
)

const itemDefinitions = [
  { event: 100, key: 'coding' },
  { event: 200, key: 'testing' },
  { event: 300, key: 'fixingBug' },
  { event: 400, key: 'commitCode' },
  { event: 500, key: 'other' }
]

const selectedEvent = ref(null)
const itemList = computed(() => {
  const itemLabels = seekingText.value?.itemLabels || {}

  return itemDefinitions.map(item => ({
    ...item,
    class: selectedEvent.value === item.event ? 'selected' : '',
    text: itemLabels[item.key] || ''
  }))
})

function getTodayString() {
  return t('seeking.todayText', {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    week: seekingText.value?.weeks?.[today.getDay()] || ''
  })
}

const today = new Date()
const timeseed = today.getMilliseconds()

/////////////////////////////////////////////////////////

const resultList = computed(() => seekingText.value?.results || [])
const luckRate = [10, 100, 500, 800, 300, 800, 500, 100, 10] // 吉凶概率分布，总数为 3120

function pickRandomWithRate(seed1, seed2) {
  const result = random(seed1, seed2) % 3120
  let addup = 0

  for (let i = 0; i < luckRate.length; i++) {
    addup += luckRate[i]
    if (result <= addup) {
      return i
    }
  }
  return 4
}

/////////////////////////////////////////////////////////

const showQiu = ref(false)
const eventClick = item => {
  clearTimeout(slideTimer)
  selectedEvent.value = item.event
  showQiu.value = true
  cardResultIndexList.value = []
}

function getNextResultIndex() {
  return pickRandomWithRate(timeseed + selectedEvent.value, slidecount)
}

let slidecount = 0

const cardResultIndexList = ref([])

const startSeeking = () => {
  slidecount = 0
  showQiu.value = false
  slide()
}

let slideTimer = null
const getSlideDuration = () => {
  if (slidecount > 33) {
    return 1500
  }

  if (slidecount > 32) {
    return 800
  }

  if (slidecount > 25) {
    return 400
  }

  if (slidecount > 20) {
    return 200
  }

  if (slidecount > 15) {
    return 150
  }

  return 100
}

function slide() {
  if (slidecount > 35) {
    return
  }

  const resultIndex = getNextResultIndex()
  cardResultIndexList.value.push(resultIndex)
  slidecount++
  slideTimer = setTimeout(slide, getSlideDuration())
}

const titleDate = computed(() => getTodayString())

onUnmounted(() => {
  clearTimeout(slideTimer)
})
</script>
<style scoped>
.info {
  text-align: center;
  color: #dc143c;
  font-size: 14px;
  padding-bottom: 5px;
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
