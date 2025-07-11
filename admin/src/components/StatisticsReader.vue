<template>
  <!-- 访客统计 -->
  <div>
    <div class="el-descriptions__header">
      <div class="el-descriptions__title">访客统计</div>
      <div class="el-descriptions__extra">
        <el-date-picker
          v-model="timeRange"
          :popper-class="pickerClass"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="shortcuts"
          teleported
          :editable="false"
          :clearable="false"
          :disabled-date="timeRangeDisabledDate"
          :default-time="[
            new Date().setHours(0, 0, 0, 0),
            new Date().setHours(23, 59, 59, 999)
          ]"
          @change="getDashboardVisitor"
        />
      </div>
    </div>
    <!-- showData 按钮展示 -->
    <div class="show-data-area" v-if="!showData">
      <el-button type="primary" @click="tryShowData" text> 显示数据 </el-button>
    </div>

    <el-row v-if="visitorData">
      <!-- PV -->
      <el-col :span="24" class="mb10">
        <el-statistic title="页面访问数(PV)" :value="visitorData.pvCount" />
        <div class="home-chart-body" v-if="pvCartData.labels.length > 0">
          <Line :data="pvCartData" :options="chartOptions" />
        </div>
      </el-col>
      <!-- IP -->
      <el-col :span="24" class="mb10">
        <el-statistic
          title="独立访客数(IP)"
          :value="visitorData.uniqueIPCount"
        />
        <div
          class="home-chart-body"
          v-if="uniqueIPTimeLineData.labels.length > 0"
        >
          <Line :data="uniqueIPTimeLineData" :options="chartOptions"></Line>
        </div>
        <div>
          ※独立访客数(IP)为所选时间段内的独立访客数，折线图中反映的是单位时间内的独立访客数量。
        </div>
      </el-col>
      <!-- 机器人爬虫访问 -->
      <el-col :span="24">
        <el-statistic
          title="机器人爬虫访问数"
          :value="visitorData.robotAccessCount"
        />
        <div class="home-chart-body" v-if="robotAccessData.labels.length > 0">
          <Line :data="robotAccessData" :options="chartOptions"></Line>
        </div>
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>
<script>
import { ref, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import moment from 'moment'
import { generateRandomAlphabetString } from '@/utils/utils'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
} from 'chart.js'
import { Line } from 'vue-chartjs'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
)
moment.locale('zh-cn')

export default {
  components: {
    Line
  },
  setup() {
    const pickerClass = ref(generateRandomAlphabetString(12))
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const timeRange = ref([startOfDay, endOfDay])
    const shortcuts = [
      // 今天
      {
        text: '今天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      // 昨天
      {
        text: '昨天',
        value: () => {
          const end = new Date()
          end.setHours(0, 0, 0, 0)
          end.setTime(end.getTime() - 1)
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          start.setTime(start.getTime() - 3600 * 1000 * 24)
          return [start, end]
        }
      },
      {
        text: '过去3天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setDate(start.getDate() - 2) // 减去2天
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去7天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setDate(start.getDate() - 6) // 减去6天
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去1个月',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setMonth(start.getMonth() - 1)
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去3个月',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setMonth(start.getMonth() - 3)
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去一年',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setFullYear(start.getFullYear() - 1)
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      }
    ]

    const timeRangeDisabledDate = time => {
      const today = new Date()
      const past370Days = new Date()
      past370Days.setDate(today.getDate() - 370)
      return (
        time.getTime() < past370Days.getTime() ||
        time.getTime() > today.getTime()
      )
    }

    const visitorData = ref(null)
    const getDashboardVisitor = () => {
      const startTime = new Date(timeRange.value[0])
      const endTime = new Date(timeRange.value[1])
      // 如果endTime是当天，则时间是当前时间
      if (moment(endTime).isSame(moment(), 'day')) {
        endTime.setHours(new Date().getHours(), new Date().getMinutes())
      }
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      authApi
        .getDashboardVisitor({
          startTime: startTime,
          endTime: endTime,
          timeZone: timeZone
        })
        .then(res => {
          visitorData.value = res.data
          showData.value = true
        })
    }

    const pvCartData = computed(() => {
      if (visitorData.value) {
        let data = visitorData.value.pv
        // data的ID格式是2024-01-13T08:00:00.000Z 按照这个时间字符串排序
        data = data.sort((a, b) => {
          return a._id > b._id ? 1 : -1
        })
        const labels = []
        const values = []
        const isOverDays = visitorData.value.isOverDays
        data.forEach(item => {
          // _id 为日期 2024-01-13T07:00:00.000Z
          let f = moment(item._id).format(
            `YYYY/MM/DD dddd${isOverDays ? '' : ' HH:mm'}`
          )
          // 空格换行
          f = f.split(' ')
          labels.push(f)
          values.push(item.count)
        })
        return {
          labels,
          datasets: [
            {
              label: 'PV',
              data: values,
              borderColor: '#409EFF'
            }
          ]
        }
      }
      return {}
    })

    const uniqueIPTimeLineData = computed(() => {
      if (visitorData.value) {
        let data = visitorData.value.uniqueIPTimeLine
        // data的ID格式是2024-01-13T08:00:00.000Z 按照这个时间字符串排序
        data = data.sort((a, b) => {
          return a._id > b._id ? 1 : -1
        })
        const labels = []
        const values = []
        const isOverDays = visitorData.value.isOverDays
        data.forEach(item => {
          // _id 为日期 2024-01-13T07:00:00.000Z
          let f = moment(item._id).format(
            `YYYY/MM/DD dddd${isOverDays ? '' : ' HH:mm'}`
          )
          // 空格换行
          f = f.split(' ')
          labels.push(f)
          values.push(item.count)
        })
        return {
          labels,
          datasets: [
            {
              label: 'IP',
              data: values,
              borderColor: '#409EFF'
            }
          ]
        }
      }
      return {}
    })

    const robotAccessData = computed(() => {
      if (visitorData.value) {
        let data = visitorData.value.robotAccess
        // data的ID格式是2024-01-13T08:00:00.000Z 按照这个时间字符串排序
        data = data.sort((a, b) => {
          return a._id > b._id ? 1 : -1
        })
        const labels = []
        const values = []
        const isOverDays = visitorData.value.isOverDays
        data.forEach(item => {
          // _id 为日期 2024-01-13T07:00:00.000Z
          let f = moment(item._id).format(
            `YYYY/MM/DD dddd${isOverDays ? '' : ' HH:mm'}`
          )
          // 空格换行
          f = f.split(' ')
          labels.push(f)
          values.push(item.count)
        })
        return {
          labels,
          datasets: [
            {
              label: '机器人访问',
              data: values,
              borderColor: '#409EFF'
            }
          ]
        }
      }
      return {}
    })

    // chart
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(155, 155, 155, 0.2)' // X轴网格线颜色
          },
          ticks: {
            beginAtZero: true,
            precision: 0,
            stepSize: 1
          }
        },
        x: {
          grid: {
            color: 'rgba(155, 155, 155, 0.2)' // X轴网格线颜色
          },
          ticks: {
            // 禁止倾斜
            maxRotation: 0
            // display: false,
          }
        }
      }
    }

    const showData = ref(false)
    const tryShowData = () => {
      getDashboardVisitor()
    }

    onMounted(() => {
      // getDashboardVisitor()
      const queryClass = `.${pickerClass.value} .el-picker-panel__icon-btn.arrow-left`
      const arrowLeft = document.querySelector(queryClass)
      if (arrowLeft) {
        arrowLeft.click()
      }
    })
    return {
      pickerClass,
      timeRange,
      shortcuts,
      timeRangeDisabledDate,
      visitorData,
      getDashboardVisitor,
      pvCartData,
      uniqueIPTimeLineData,
      robotAccessData,
      chartOptions,
      showData,
      tryShowData
    }
  }
}
</script>
<style scoped></style>
