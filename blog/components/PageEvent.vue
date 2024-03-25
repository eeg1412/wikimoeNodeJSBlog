<template>
  <div>
    <ClientOnly>
      <div class="page-event-body">
        <div class="page-event-table-body">
          <table class="page-event-table">
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
                    :style="{
                      backgroundColor: tdItem.color || '',
                      height: tdItem.rowspan * 25 + 'px',
                    }"
                  >
                    <div class="page-event-table-td-title-text">
                      {{ tdItem.title }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
<script setup>
import { getEventListApiFetch } from '@/api/event'
const eventList = ref([])
const startTime = ref(null)
const endTime = ref(null)
const initTime = () => {
  const now = new Date()
  // 获取当前系统的月的第一天和最后一天
  startTime.value = new Date(now.getFullYear(), now.getMonth(), 1)
  endTime.value = new Date(now.getFullYear(), now.getMonth() + 1, 0)
}
const getList = async () => {
  const res = await getEventListApiFetch({
    startTime: new Date(startTime.value).toISOString(),
    endTime: new Date(endTime.value).toISOString(),
  }).catch((err) => {
    console.log(err)
  })
  eventList.value = res.data.value.list
  setData()
}
// const groupEvents = (eventList) => {
//   // 按开始日期排序

//   const groupedEvents = []

//   for (const event of eventList) {
//     if (groupedEvents.length === 0) {
//       groupedEvents.push([event])
//     } else {
//       // 重叠flag
//       let overlap = true
//       for (const group of groupedEvents) {
//         for (const item of group) {
//           const eventStartTime = new Date(event.startTime).getDate()
//           const eventEndTime = new Date(event.endTime).getDate()
//           const itemStartTime = new Date(item.startTime).getDate()
//           const itemEndTime = new Date(item.endTime).getDate()

//           if (itemEndTime <= eventStartTime || eventEndTime <= itemStartTime) {
//             // 没有重叠
//             overlap = false
//             break
//           }
//         }
//         if (overlap) {
//           groupedEvents.push([event])
//           break
//         } else {
//           group.push(event)
//         }
//       }
//     }
//   }

//   return groupedEvents
// }
const tableData = ref([])
const setData = () => {
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
  // // 将eventList.value转换成日期不重叠的数组
  // const groupedEvents = groupEvents(eventList.value)
  // console.log(groupedEvents)
  // const emptyList = []

  // 根据活动列表生成数组
  const eventListTableData = []
  eventList.value.forEach((event) => {
    let eventStartTime = new Date(event.startTime)
    let eventEndTime = new Date(event.endTime)
    // 如果开始时间比startTime.value小，就设置为startTime.value
    if (eventStartTime < startTime.value) {
      eventStartTime = startTime.value
    }
    // 如果结束时间比endTime.value大，就设置为endTime.value
    if (eventEndTime > endTime.value) {
      eventEndTime = endTime.value
    }
    const startDay = eventStartTime.getDate()
    const endDay = eventEndTime.getDate()
    const rowspan = endDay - startDay + 1
    eventListTableData.push({
      title: rowspan === 1 ? event.title[0] : event.title,
      startDay: startDay,
      endDay: endDay,
      class: 'event',
      id: event._id,
      color: event.color || event?.eventtype?.color || '#000',
      rowspan,
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
  /* border: 1px solid #ccc; */
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
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.page-event-body {
  border: 1px solid #ccc;
}
.page-event-table-body {
  overflow: auto;
  background-color: #f3f3f3;
}
/* page-event-table-tr 斑马 */
.page-event-table-tr:nth-child(odd) {
  background-color: #f3f3f3;
}
.page-event-table-tr:nth-child(even) {
  background-color: #ffffff;
}
.page-event-table-td-title-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 100%;
}
</style>
