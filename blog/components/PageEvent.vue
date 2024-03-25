<template>
  <div>
    <div class="page-event-body">
      <DivLoading :loading="eventLoading" />
      <div class="page-event-month-year">
        <div>
          <!-- UButton icon heroicon -->
          <UButton
            icon="i-heroicons-chevron-double-left"
            size="2xs"
            color="primary"
            variant="ghost"
            @click="lastYear"
            :disabled="!showLastYear"
          ></UButton>
          <UButton
            icon="i-heroicons-chevron-left"
            size="2xs"
            color="primary"
            variant="ghost"
            @click="lastMonth"
            :disabled="!showLastMonth"
          ></UButton>
        </div>
        {{ monthYear }}
        <div>
          <UButton
            icon="i-heroicons-chevron-right"
            size="2xs"
            color="primary"
            variant="ghost"
            @click="nextMonth"
            :disabled="!showNextMonth"
          ></UButton>
          <UButton
            icon="i-heroicons-chevron-double-right"
            size="2xs"
            color="primary"
            variant="ghost"
            @click="nextYear"
            :disabled="!showNextYear"
          ></UButton>
        </div>
      </div>
      <div class="page-event-table-body custom-scroll scroll-not-hide">
        <table class="page-event-table" v-if="eventList.length > 0">
          <tbody>
            <tr
              v-for="(item, index) in tableData"
              :key="index"
              class="page-event-table-tr"
            >
              <td
                class="page-event-table-td"
                v-for="(tdItem, tdIndex) in item"
                :key="tdIndex"
                :rowspan="tdItem.rowspan"
                :class="tdItem.class"
              >
                <div
                  class="page-event-table-td-title"
                  :class="{
                    'no-start': tdItem.isNotStart,
                    'no-end': tdItem.isNotEnd,
                  }"
                  :style="{
                    backgroundColor: tdItem.color || '',
                    height: tdItem.rowspan * 25 + 'px',
                  }"
                  @click="tryOpenEvent(tdItem)"
                >
                  <div class="page-event-table-td-title-text">
                    {{ tdItem.title }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="page-event-table-empty text-primary-500" v-else>
          该月无事发生
        </div>
      </div>
    </div>
    <UModal v-model="eventOpen">
      <div
        class="flex items-center justify-between page-event-current-event-title"
      >
        <h3
          class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
        >
          <span
            class="page-event-block"
            :style="{
              backgroundColor: currentData.eventtype?.color,
            }"
            v-if="currentData.eventtype"
            >{{ currentData.eventtype?.name }}</span
          >{{ currentData.title }}
        </h3>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          @click="eventOpen = false"
        />
      </div>
      <div class="custom-scroll scroll-not-hide page-event-current-event-body">
        <!-- 时间 -->
        <div class="text-gray-700 text-md">
          <span class="font-bold">时间：</span
          >{{ formatDate(currentData.startTime) }} ~
          {{ formatDate(currentData.endTime) }}
        </div>
        <!-- 内容 -->
        <HtmlContent :content="currentData.content" />
        <!-- 相关链接 urlList -->
        <div
          class="text-sm mb-2 mt-2 text-gray-500 flex-shrink-0"
          v-if="currentData.urlList.length > 0"
        >
          <a
            :href="url.url"
            target="_blank"
            class="inline-flex items-center text-primary-500 mr-2"
            v-for="(url, index) in currentData.urlList"
            :key="index"
          >
            <UIcon name="i-heroicons-link" class="align-middle mr-1" />
            {{ url.text }}
          </a>
        </div>
      </div>
    </UModal>
  </div>
</template>
<script setup>
import { getEventListApiFetch } from '@/api/event'
const eventList = ref([])
const startTime = ref(null)
const endTime = ref(null)
// 月
const monthYear = computed(() => {
  const start = new Date(startTime.value)
  // const end = new Date(endTime.value)
  return `${start.getFullYear()}年${start.getMonth() + 1}月`
})
const initTime = () => {
  const now = new Date()
  // 获取当前系统的月的第一天和最后一天
  startTime.value = new Date(now.getFullYear(), now.getMonth(), 1)
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  endDate.setHours(23, 59, 59)
  endTime.value = endDate
}
const eventLoading = ref(false)
const getList = async () => {
  eventLoading.value = true
  const res = await getEventListApiFetch({
    startTime: new Date(startTime.value).toISOString(),
    endTime: new Date(endTime.value).toISOString(),
  }).catch((err) => {
    console.log(err)
  })
  eventList.value = res?.list || []
  setData()
  eventLoading.value = false
}

const tableData = ref([])
const setData = () => {
  tableData.value = []
  // 根据startTime 获取这个月有多少天
  // 获取startTime的Date对象
  const date = new Date(startTime.value)
  // 获取下个月的第一天
  const firstDayOfNextMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  )
  // 获取这个月的最后一天
  const lastDayOfThisMonth = new Date(firstDayOfNextMonth - 1)
  // 获取这个月有多少天
  const daysInThisMonth = lastDayOfThisMonth.getDate()

  // 根据活动列表生成数组
  const eventListTableData = []
  eventList.value.forEach((event) => {
    let eventStartTime = new Date(event.startTime)
    let eventEndTime = new Date(event.endTime)
    let isNotStart = false
    let isNotEnd = false
    // 如果开始时间比startTime.value小，就设置为startTime.value
    if (eventStartTime < startTime.value) {
      eventStartTime = startTime.value
      isNotStart = true
    }
    // 如果结束时间比endTime.value大，就设置为endTime.value
    if (eventEndTime > endTime.value) {
      eventEndTime = endTime.value
      isNotEnd = true
    }
    const startDay = eventStartTime.getDate()
    const endDay = eventEndTime.getDate()
    const rowspan = endDay - startDay + 1
    eventListTableData.push({
      isNotStart,
      isNotEnd,
      eventtype: event.eventtype,
      title: rowspan === 1 ? event.title[0] : event.title,
      content: event.content,
      startTime: event.startTime,
      endTime: event.endTime,
      startDay: startDay,
      endDay: endDay,
      class: 'event',
      id: event._id,
      color: event.color || event?.eventtype?.color || '#000',
      rowspan,
      urlList: event.urlList,
    })
  })
  console.log(eventListTableData)
  // 循环这个月的每一天
  for (let i = 1; i <= daysInThisMonth; i++) {
    const dataList = []
    dataList.push({
      title: String(i),
      class: 'day',
      rowspan: 1,
    })
    // 获取是周几
    const week = new Date(date.getFullYear(), date.getMonth(), i).getDay()
    const weekStrList = ['日', '一', '二', '三', '四', '五', '六']
    dataList.push({
      title: weekStrList[week],
      class: 'week',
      rowspan: 1,
    })
    eventListTableData.forEach((event) => {
      if (i === event.startDay) {
        dataList.push(event)
      } else if (i > event.endDay || i < event.startDay) {
        dataList.push({
          title: '',
          class: 'empty',
          rowspan: 1,
        })
      }
    })

    tableData.value.push(dataList)
  }
  console.log(tableData.value)
}
// 开始时间和结束时间的范围在1980年1月1日到本地时间的20年之后
// 20年之后的时间
const maxDate = new Date(new Date().getFullYear() + 20, 11, 31)
// 1980年1月1日
const minDate = new Date(1980, 0, 1)
// 是否显示上一年
const showLastYear = computed(() => {
  const date = new Date(startTime.value)
  return date.getFullYear() > 1980
})
// 是否显示下一年
const showNextYear = computed(() => {
  const date = new Date(startTime.value)
  return date.getFullYear() < maxDate.getFullYear()
})
// 是否显示上个月
const showLastMonth = computed(() => {
  const date = new Date(startTime.value)
  date.setMonth(date.getMonth() - 1)
  return date >= minDate
})
// 是否显示下个月
const showNextMonth = computed(() => {
  const date = new Date(startTime.value)
  date.setMonth(date.getMonth() + 1)
  return date <= maxDate
})
// 去年
const lastYear = () => {
  const date = new Date(startTime.value)
  date.setFullYear(date.getFullYear() - 1)
  startTime.value = new Date(date.getFullYear(), date.getMonth(), 1)
  let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  endDate.setHours(23, 59, 59)
  endTime.value = endDate
  getList()
}
// 下一年
const nextYear = () => {
  const date = new Date(startTime.value)
  date.setFullYear(date.getFullYear() + 1)
  startTime.value = new Date(date.getFullYear(), date.getMonth(), 1)
  let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  endDate.setHours(23, 59, 59)
  endTime.value = endDate
  getList()
}
// 上个月
const lastMonth = () => {
  const date = new Date(startTime.value)
  date.setMonth(date.getMonth() - 1)
  startTime.value = new Date(date.getFullYear(), date.getMonth(), 1)
  let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  endDate.setHours(23, 59, 59)
  endTime.value = endDate
  getList()
}
// 下个月
const nextMonth = () => {
  const date = new Date(startTime.value)
  date.setMonth(date.getMonth() + 1)
  startTime.value = new Date(date.getFullYear(), date.getMonth(), 1)
  let endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  endDate.setHours(23, 59, 59)
  endTime.value = endDate
  getList()
}

const eventOpen = ref(false)
const currentData = ref(null)
const tryOpenEvent = (data) => {
  if (data.class === 'event') {
    currentData.value = data
    eventOpen.value = true
  }
}

onMounted(() => {
  nextTick(() => {
    initTime()
    getList()
  })
})
</script>
<style scoped>
.page-event-table {
  width: max-content;
}
.page-event-table-td {
  width: 25px;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
}
/* .page-event-table-td.event {
  background-color: #ffffff;
} */
.page-event-table-td.event .page-event-table-td-title {
  /* 竖排显示文字 */
  writing-mode: vertical-rl;
  color: #ffffff;
  border-radius: 25px;
  overflow: hidden;
  white-space: nowrap;
  width: 23px;
  margin: 0 1px;
  box-sizing: border-box;
  padding: 5px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.page-event-table-td.event .page-event-table-td-title.no-start {
  /* 左上角，右上角不要圆角 */
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.page-event-table-td.event .page-event-table-td-title.no-end {
  /* 左下角，右下角不要圆角 */
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.page-event-body {
  @apply border border-primary-200 border-solid;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}
.page-event-table-body {
  overflow: auto;
  @apply bg-primary-50;
}
/* page-event-table-tr 斑马 */
.page-event-table-tr:nth-child(odd) {
  @apply bg-primary-50;
}
.page-event-table-tr:nth-child(even) {
  @apply bg-white;
}
.page-event-table-td-title-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 100%;
}
.page-event-month-year {
  @apply text-center;
  padding: 10px 5px;
  display: flex;
  justify-content: space-between;
}
.page-event-table-empty {
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.page-event-table-td.week .page-event-table-td-title-text,
.page-event-table-td.day .page-event-table-td-title-text {
  display: flex;
  justify-content: center;
  align-items: center;
}
.page-event-current-event-body {
  max-height: calc(100vh - 150px);
  max-height: calc(100dvh - 150px);
  min-height: 50px;
  overflow: auto;
  font-size: 13px;
  padding: 12px;
}
.page-event-current-event-title {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.page-event-block {
  color: #fff;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
  margin-right: 5px;
  border-radius: 5px;
}
</style>
<style>
.page-event-current-content p {
  margin: 10px 0;
}
</style>
