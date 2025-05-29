<template>
  <div>
    <div class="el-descriptions__header">
      <div class="el-descriptions__title">速度统计</div>
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
            new Date().setHours(23, 59, 59, 999),
          ]"
          @change="getLoadingTimeData(true)"
        />
      </div>
    </div>

    <!-- 显示数据按钮区域 -->
    <div class="show-data-area" v-if="!showData">
      <el-button type="primary" @click="tryShowData" text> 显示数据 </el-button>
    </div>

    <!-- 顶部统计指标区域 -->
    <el-row v-if="loadingTimeData && showData">
      <el-col :span="8" :xs="8" class="mb15">
        <el-statistic
          title="最快加载时间"
          :value="loadingTimeData.stats.minDuration / 1000"
          :precision="2"
        >
          <template #suffix>秒</template>
        </el-statistic>
      </el-col>
      <el-col :span="8" :xs="8" class="mb15">
        <el-statistic
          title="平均加载时间"
          :value="loadingTimeData.stats.avgDuration / 1000"
          :precision="2"
        >
          <template #suffix>秒</template>
        </el-statistic>
      </el-col>
      <el-col :span="8" :xs="8" class="mb15">
        <el-statistic
          title="最慢加载时间"
          :value="loadingTimeData.stats.maxDuration / 1000"
          :precision="2"
        >
          <template #suffix>秒</template>
        </el-statistic>
      </el-col>
    </el-row>

    <!-- 中部表格 - 最快加载时间 -->
    <el-row v-if="loadingTimeData && showData">
      <el-col :span="24" class="p10">
        <div class="mb10 fb statistics-title">最快加载时间记录 (前100条)</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="fastestDataPaginated"
            style="width: 100%"
            height="466px"
          >
            <el-table-column label="加载时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.performanceNavigationTiming.duration) }}
                秒
              </template>
            </el-table-column>
            <el-table-column
              prop="ip"
              label="IP"
              min-width="200"
            ></el-table-column>
            <el-table-column label="IP信息" min-width="300">
              <template #default="{ row }">
                <IpInfoDisplay :ipInfo="row.ipInfo" />
              </template>
            </el-table-column>

            <el-table-column label="时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="loadingTimeData.fastestData.length"
              :pager-count="5"
              small
              v-model:current-page="fastestPagination.currentPage"
              v-model:page-size="fastestPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部表格 - 最慢加载时间 -->
    <el-row v-if="loadingTimeData && showData">
      <el-col :span="24" class="p10">
        <div class="mb10 fb statistics-title">最慢加载时间记录 (前100条)</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="slowestDataPaginated"
            style="width: 100%"
            height="466px"
          >
            <el-table-column label="加载时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.performanceNavigationTiming.duration) }}
                秒
              </template>
            </el-table-column>
            <el-table-column
              prop="ip"
              label="IP"
              min-width="200"
            ></el-table-column>
            <el-table-column label="IP信息" min-width="300">
              <template #default="{ row }">
                <IpInfoDisplay :ipInfo="row.ipInfo" />
              </template>
            </el-table-column>

            <el-table-column label="时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="loadingTimeData.slowestData.length"
              :pager-count="5"
              small
              v-model:current-page="slowestPagination.currentPage"
              v-model:page-size="slowestPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>

<script>
import { onMounted, reactive, ref, computed } from 'vue'
import { generateRandomAlphabetString } from '@/utils/utils'
import { authApi } from '@/api'
import moment from 'moment'
import IpInfoDisplay from '@/components/IpInfoDisplay.vue'

export default {
  components: {
    IpInfoDisplay,
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
        },
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
        },
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
        },
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
        },
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
        },
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
        },
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
        },
      },
    ]

    const timeRangeDisabledDate = (time) => {
      const today = new Date()
      const past370Days = new Date()
      past370Days.setDate(today.getDate() - 370)
      return (
        time.getTime() < past370Days.getTime() ||
        time.getTime() > today.getTime()
      )
    }

    const loadingTimeData = ref(null)
    const showData = ref(false)

    // 分页相关
    const fastestPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })

    const slowestPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })

    // 计算属性 - 分页后的数据
    const fastestDataPaginated = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.fastestData) {
        return loadingTimeData.value.fastestData.slice(
          (fastestPagination.currentPage - 1) * fastestPagination.pageSize,
          fastestPagination.currentPage * fastestPagination.pageSize
        )
      }
      return []
    })

    const slowestDataPaginated = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.slowestData) {
        return loadingTimeData.value.slowestData.slice(
          (slowestPagination.currentPage - 1) * slowestPagination.pageSize,
          slowestPagination.currentPage * slowestPagination.pageSize
        )
      }
      return []
    })

    const getLoadingTimeData = (resetPage) => {
      const startTime = new Date(timeRange.value[0])
      const endTime = new Date(timeRange.value[1])
      // 如果endTime是当天，则时间是当前时间
      if (moment(endTime).isSame(moment(), 'day')) {
        endTime.setHours(new Date().getHours(), new Date().getMinutes())
      }
      authApi
        .getLoadingTime({
          startTime: startTime,
          endTime: endTime,
        })
        .then((res) => {
          if (resetPage) {
            fastestPagination.currentPage = 1
            slowestPagination.currentPage = 1
          }
          loadingTimeData.value = res.data
          showData.value = true
        })
    }

    const tryShowData = () => {
      getLoadingTimeData()
    }

    // 格式化持续时间，毫秒转为秒并保留两位小数
    const formatDuration = (duration) => {
      if (duration === null || duration === undefined) return '-'
      return (duration / 1000).toFixed(2)
    }

    // 格式化日期时间
    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-'
      return moment(dateStr).format('YYYY-MM-DD HH:mm:ss')
    }

    onMounted(() => {
      const queryClass = `.${pickerClass.value} .el-picker-panel__icon-btn.arrow-left`
      const arrowLeft = document.querySelector(queryClass)
      if (arrowLeft) {
        arrowLeft.click()
      }
    })

    return {
      timeRange,
      pickerClass,
      shortcuts,
      timeRangeDisabledDate,
      loadingTimeData,
      getLoadingTimeData,
      showData,
      tryShowData,
      formatDuration,
      formatDateTime,
      fastestPagination,
      slowestPagination,
      fastestDataPaginated,
      slowestDataPaginated,
    }
  },
}
</script>

<style scoped>
.statistics-title {
  height: 20px;
  line-height: 20px;
}
.statistics-panel {
  border: 1px solid var(--el-border-color);
  height: 515px;
  box-sizing: border-box;
  padding-bottom: 10px;
}
</style>
