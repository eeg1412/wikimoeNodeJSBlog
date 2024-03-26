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
        <Calendar
          :events="eventList"
          :startTime="startTime"
          v-show="eventList.length > 0"
          @eventClick="tryOpenEvent"
        />
        <div
          class="page-event-table-empty text-primary-500"
          v-show="eventList.length === 0"
        >
          <div v-show="!eventLoading">该月无事发生</div>
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
        <div class="flex items-center">
          <div class="flex items-center">
            <UIcon name="i-heroicons-clock" />
          </div>
          <div class="text-gray-700 text-md ml-2">
            {{ formatDate(currentData.startTime) }} ~
            {{ formatDate(currentData.endTime) }}
          </div>
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
  eventList.value = []
  const res = await getEventListApiFetch({
    startTime: new Date(startTime.value).toISOString(),
    endTime: new Date(endTime.value).toISOString(),
  }).catch((err) => {
    console.log(err)
  })
  eventList.value = res?.list || []
  eventLoading.value = false
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
  currentData.value = data
  addStyle()
  eventOpen.value = true
}

const styleId = generateRandomString(8)
const addStyle = () => {
  const style = document.createElement('style')
  style.id = styleId
  style.innerHTML = `
    html {
        overflow: visible !important;
        padding-right: 0 !important;
      }
    `
  document.body.appendChild(style)
}
const removeStyle = () => {
  const style = document.getElementById(styleId)
  if (style) {
    document.body.removeChild(style)
  }
}
// watch eventOpen
watch(eventOpen, (val) => {
  // 如果打开在body末尾加上style标签，id为pageEvent
  if (!val) {
    removeStyle()
  }
})

onMounted(() => {
  nextTick(() => {
    initTime()
    getList()
  })
})
onUnmounted(() => {
  removeStyle()
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
  overflow: hidden;
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
