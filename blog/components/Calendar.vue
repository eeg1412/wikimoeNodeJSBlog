<template>
  <div class="content">
    <div class="calendar">
      <div class="calendar-weekly">
        <div class="calendar-youbi" v-for="n in 7" :key="n">
          {{ youbi(n - 1) }}
        </div>
      </div>
      <div
        class="calendar-weekly"
        v-for="(week, index) in calendars"
        :key="index"
      >
        <div
          class="calendar-daily"
          :class="{ outside: currentMonth !== day.month }"
          v-for="(day, index) in week"
          :key="index"
        >
          <div
            class="calendar-day"
            :class="{
              'is-now': day.month === nowMonth && day.day === nowDay,
            }"
          >
            {{ day.day }}
          </div>
          <div v-for="dayEvent in day.dayEvents" :key="dayEvent.id">
            <div
              v-if="dayEvent.width"
              class="calendar-event"
              :style="`width:calc(${dayEvent.width}% + ${
                dayEvent.width / 100 - 1
              }px);background-color:${
                dayEvent.color || dayEvent.eventtype?.color || '#000000'
              }`"
              @click="eventClick(dayEvent)"
            >
              {{ dayEvent.title }}
            </div>
            <div v-else style="height: 26px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import moment from 'moment'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  startTime: {
    type: Object,
    default: moment(),
  },
})

// 今天的日子
const nowDay = moment().date()
// 今天的月份
const nowMonth = moment().format('YYYY-MM')

const currentDate = computed(() => {
  return moment(props.startTime)
})

const emits = defineEmits(['eventClick'])

const eventClick = (event) => {
  emits('eventClick', event)
}

const getStartDate = () => {
  let date = moment(currentDate.value)
  date.startOf('month')
  const youbiNum = date.day()
  return date.subtract(youbiNum, 'days')
}
const getEndDate = () => {
  let date = moment(currentDate.value)
  date.endOf('month')
  const youbiNum = date.day()
  return date.add(6 - youbiNum, 'days')
}

const getEventWidth = (start, end, day) => {
  let betweenDays = moment(end).diff(moment(start), 'days')
  if (betweenDays > 6 - day) {
    return (6 - day) * 100 + 100
  } else {
    return betweenDays * 100 + 100
  }
}

const getCalendar = () => {
  let startDate = getStartDate()
  const endDate = getEndDate()
  const weekNumber = Math.ceil(endDate.diff(startDate, 'days') / 7)

  let calendars = []
  let calendarDate = getStartDate()

  for (let week = 0; week < weekNumber; week++) {
    let weekRow = []
    for (let day = 0; day < 7; day++) {
      let dayEvents = getDayEvents(calendarDate, day)
      weekRow.push({
        day: calendarDate.get('date'),
        month: calendarDate.format('YYYY-MM'),
        dayEvents,
      })
      calendarDate.add(1, 'days')
    }
    calendars.push(weekRow)
  }
  return calendars
}

const getStackEvents = (
  event,
  day,
  stackIndex,
  dayEvents,
  startedEvents,
  start
) => {
  ;[stackIndex, dayEvents] = getStartedEvents(
    stackIndex,
    startedEvents,
    dayEvents
  )
  let width = getEventWidth(start, event.endTime, day)
  Object.assign(event, {
    stackIndex,
  })
  dayEvents.push({ ...event, width })
  stackIndex++
  return [stackIndex, dayEvents]
}
const getStartedEvents = (stackIndex, startedEvents, dayEvents) => {
  let startedEvent
  do {
    startedEvent = startedEvents.find(
      (event) => event.stackIndex === stackIndex
    )
    if (startedEvent) {
      dayEvents.push(startedEvent) //ダミー領域として利用するため
      stackIndex++
    }
  } while (typeof startedEvent !== 'undefined')
  return [stackIndex, dayEvents]
}
const getDayEvents = (date, day) => {
  let stackIndex = 0
  let dayEvents = []
  let startedEvents = []
  sortedEvents.value.forEach((event) => {
    let startDate = moment(event.startTime).format('YYYY-MM-DD')
    let endDate = moment(event.endTime).format('YYYY-MM-DD')
    let Date = date.format('YYYY-MM-DD')
    if (startDate <= Date && endDate >= Date) {
      if (startDate === Date) {
        ;[stackIndex, dayEvents] = getStackEvents(
          event,
          day,
          stackIndex,
          dayEvents,
          startedEvents,
          event.startTime
        )
      } else if (day === 0) {
        ;[stackIndex, dayEvents] = getStackEvents(
          event,
          day,
          stackIndex,
          dayEvents,
          startedEvents,
          Date
        )
      } else {
        startedEvents.push(event)
      }
    }
  })
  return dayEvents
}

const youbi = (dayIndex) => {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  return week[dayIndex]
}

const calendars = computed(() => {
  return getCalendar()
})

const currentMonth = computed(() => {
  return currentDate.value.format('YYYY-MM')
})

const sortedEvents = computed(() => {
  return props.events.slice().sort(function (a, b) {
    let startDate = moment(a.startTime).format('YYYY-MM-DD')
    let startDate_2 = moment(b.startTime).format('YYYY-MM-DD')
    if (startDate < startDate_2) return -1
    if (startDate > startDate_2) return 1
    return 0
  })
})

onMounted(() => {})
</script>
<style scoped>
.content {
  width: 100%;
}
.calendar {
  max-width: 100%;
  border-top: 1px solid;
  @apply border-primary-200;
  font-size: 0.8em;
}
.calendar-weekly {
  display: flex;
  /* border-left: 1px solid #e0e0e0; */
}
.calendar-daily {
  flex: 1;
  min-height: 13vh;
  border-right: 1px solid;
  border-bottom: 1px solid;
  box-sizing: border-box;
  @apply border-primary-200;
}
.calendar-weekly:last-child .calendar-daily {
  border-bottom: none;
}
.calendar-daily:last-child {
  border-right: none;
}
.calendar-day {
  text-align: center;
}
.calendar-day.is-now {
  @apply text-white bg-primary-500;
}
.calendar-youbi {
  flex: 1;
  border-right: 1px solid;
  box-sizing: border-box;
  text-align: center;
  @apply bg-primary-50 border-primary-200;
}
.calendar-youbi:last-child {
  border-right: none;
}
/* .outside {
  background-color: #fbfbfb;
  color: #c0c0c0;
  @apply bg-primary-50;
} */
.calendar-event {
  color: white;
  margin-bottom: 1px;
  height: 25px;
  line-height: 25px;
  position: relative;
  z-index: 1;
  border-radius: 4px;
  padding-left: 4px;
  overflow: hidden;
  cursor: pointer;
}
</style>
