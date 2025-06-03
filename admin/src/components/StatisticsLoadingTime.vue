<template>
  <div>
    <div class="el-descriptions__header">
      <div class="el-descriptions__title">加载时间</div>
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
          :value="roundDuration(loadingTimeData.stats.minDuration)"
          :precision="2"
        >
          <template #suffix>秒</template>
        </el-statistic>
      </el-col>
      <el-col :span="8" :xs="8" class="mb15">
        <el-statistic
          title="平均加载时间"
          :value="roundDuration(loadingTimeData.stats.avgDuration)"
          :precision="2"
        >
          <template #suffix>秒</template>
        </el-statistic>
      </el-col>
      <el-col :span="8" :xs="8" class="mb15">
        <el-statistic
          title="最慢加载时间"
          :value="roundDuration(loadingTimeData.stats.maxDuration)"
          :precision="2"
        >
          <template #suffix>秒</template>
        </el-statistic>
      </el-col>
    </el-row>

    <!-- 显示时间推移图表 -->
    <el-row v-if="loadingTimeData && showData">
      <el-col :span="24" class="mb10">
        <div class="mb10 fb statistics-title">平均加载时间推移图表</div>
        <div
          class="home-chart-body"
          v-if="timeSeriesChartData.labels.length > 0"
        >
          <Line :data="timeSeriesChartData" :options="chartOptions" />
        </div>
        <div>※图表显示了不同时间段内的平均加载时间。</div>
      </el-col>
    </el-row>

    <!-- 最慢加载时间 -->
    <el-row v-if="loadingTimeData && showData">
      <el-col :span="24" class="p10">
        <div class="mb10 fb statistics-title">整体最慢加载时间记录</div>
        <div class="mb10 statistics-panel type-2">
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
            <el-table-column label="UA信息" width="100" align="center">
              <template #default="{ row }">
                <el-tooltip
                  effect="dark"
                  placement="top"
                  :show-after="200"
                  max-width="400"
                >
                  <template #content>
                    <div class="tooltip-content">
                      <div>系统：{{ row.deviceInfo?.os?.name }}</div>
                      <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
                      <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
                      <div>
                        浏览器版本号： {{ row.deviceInfo?.browser?.version }}
                      </div>
                      <div v-if="row.deviceInfo?.ua" class="word-break">
                        UA：{{ row.deviceInfo?.ua }}
                      </div>
                    </div>
                  </template>
                  <el-button size="small" type="primary" text>显示</el-button>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="性能统计" width="100" align="center">
              <template #default="{ row }">
                <el-tooltip
                  effect="dark"
                  placement="top"
                  :show-after="200"
                  max-width="400"
                >
                  <template #content>
                    <div class="tooltip-content">
                      <div>
                        重定向计数：{{
                          row.performanceNavigationTiming.redirectCount
                        }}
                      </div>
                      <div>
                        DNS查询耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.domainLookupDuration
                          )
                        }}
                      </div>
                      <div>
                        TCP握手耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.connectDuration
                          )
                        }}
                      </div>
                      <div>
                        DOM解析完成耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.domInteractive
                          )
                        }}
                      </div>
                      <div>
                        DOM完全加载耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.domComplete
                          )
                        }}
                      </div>
                      <div>
                        加载事件处理耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.loadEventDuration
                          )
                        }}
                      </div>
                      <div>
                        条目类型：{{
                          row.performanceNavigationTiming.entryType
                        }}
                      </div>
                      <div class="word-break">
                        URL：{{ row.performanceNavigationTiming.name }}
                      </div>
                      <div>
                        类型：{{ row.performanceNavigationTiming.type }}
                      </div>
                    </div>
                  </template>
                  <el-button size="small" type="primary" text>显示</el-button>
                </el-tooltip>
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

    <!-- 最快加载时间 -->
    <el-row v-if="loadingTimeData && showData">
      <el-col :span="24" class="p10">
        <div class="mb10 fb statistics-title">整体最快加载时间记录</div>
        <div class="mb10 statistics-panel type-2">
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

            <el-table-column label="UA信息" width="100" align="center">
              <template #default="{ row }">
                <el-tooltip
                  effect="dark"
                  placement="top"
                  :show-after="200"
                  max-width="400"
                >
                  <template #content>
                    <div class="tooltip-content">
                      <div>系统：{{ row.deviceInfo?.os?.name }}</div>
                      <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
                      <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
                      <div>
                        浏览器版本号： {{ row.deviceInfo?.browser?.version }}
                      </div>
                      <div v-if="row.deviceInfo?.ua" class="word-break">
                        UA：{{ row.deviceInfo?.ua }}
                      </div>
                    </div>
                  </template>
                  <el-button size="small" type="primary" text>显示</el-button>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="性能统计" width="100" align="center">
              <template #default="{ row }">
                <el-tooltip
                  effect="dark"
                  placement="top"
                  :show-after="200"
                  max-width="400"
                >
                  <template #content>
                    <div class="tooltip-content">
                      <div>
                        重定向计数：{{
                          row.performanceNavigationTiming.redirectCount
                        }}
                      </div>
                      <div>
                        DNS查询耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.domainLookupDuration
                          )
                        }}
                      </div>
                      <div>
                        TCP握手耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.connectDuration
                          )
                        }}
                      </div>
                      <div>
                        DOM解析完成耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.domInteractive
                          )
                        }}
                      </div>
                      <div>
                        DOM完全加载耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.domComplete
                          )
                        }}
                      </div>
                      <div>
                        加载事件处理耗时：{{
                          formatDuration(
                            row.performanceNavigationTiming.loadEventDuration
                          )
                        }}
                      </div>
                      <div>
                        条目类型：{{
                          row.performanceNavigationTiming.entryType
                        }}
                      </div>
                      <div class="word-break">
                        URL：{{ row.performanceNavigationTiming.name }}
                      </div>
                      <div>
                        类型：{{ row.performanceNavigationTiming.type }}
                      </div>
                    </div>
                  </template>
                  <el-button size="small" type="primary" text>显示</el-button>
                </el-tooltip>
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

    <!-- 国家级统计 -->
    <el-row v-if="loadingTimeData && showData">
      <!-- 国家最慢加载时间 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">国家/地区最慢平均加载时间</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="countrySlowStatsPaginated"
            style="width: 100%"
            height="440px"
            empty-text="暂无数据"
          >
            <el-table-column
              prop="country"
              label="国家/地区"
              min-width="150"
            ></el-table-column>
            <el-table-column label="平均加载时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.avgDuration) }} 秒
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              label="样本数量"
              width="100"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="loadingTimeData.countrySlowStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="countrySlowPagination.currentPage"
              v-model:page-size="countrySlowPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 国家最快加载时间 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">国家/地区最快平均加载时间</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="countryFastStatsPaginated"
            style="width: 100%"
            height="440px"
            empty-text="暂无数据"
          >
            <el-table-column
              prop="country"
              label="国家/地区"
              min-width="150"
            ></el-table-column>
            <el-table-column label="平均加载时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.avgDuration) }} 秒
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              label="样本数量"
              width="100"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="loadingTimeData.countryFastStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="countryFastPagination.currentPage"
              v-model:page-size="countryFastPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 地区级统计 -->
    <el-row v-if="loadingTimeData && showData">
      <!-- 地区最慢加载时间 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">行政区划最慢平均加载时间</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="regionSlowStatsPaginated"
            style="width: 100%"
            height="440px"
            empty-text="暂无数据"
          >
            <el-table-column
              prop="location"
              label="行政区划"
              min-width="150"
            ></el-table-column>
            <el-table-column label="平均加载时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.avgDuration) }} 秒
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              label="样本数量"
              width="100"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="loadingTimeData.regionSlowStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="regionSlowPagination.currentPage"
              v-model:page-size="regionSlowPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 地区最快加载时间 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">行政区划最快平均加载时间</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="regionFastStatsPaginated"
            style="width: 100%"
            height="440px"
            empty-text="暂无数据"
          >
            <el-table-column
              prop="location"
              label="行政区划"
              min-width="150"
            ></el-table-column>
            <el-table-column label="平均加载时间" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.avgDuration) }} 秒
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              label="样本数量"
              width="100"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="loadingTimeData.regionFastStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="regionFastPagination.currentPage"
              v-model:page-size="regionFastPagination.pageSize"
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
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

export default {
  components: {
    IpInfoDisplay,
    Line,
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

    // 新增国家和地区统计分页配置
    const countrySlowPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })

    const countryFastPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })

    const regionSlowPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })

    const regionFastPagination = reactive({
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

    // 新增国家和地区统计分页计算属性
    const countrySlowStatsPaginated = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.countrySlowStats) {
        return loadingTimeData.value.countrySlowStats.slice(
          (countrySlowPagination.currentPage - 1) *
            countrySlowPagination.pageSize,
          countrySlowPagination.currentPage * countrySlowPagination.pageSize
        )
      }
      return []
    })

    const countryFastStatsPaginated = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.countryFastStats) {
        return loadingTimeData.value.countryFastStats.slice(
          (countryFastPagination.currentPage - 1) *
            countryFastPagination.pageSize,
          countryFastPagination.currentPage * countryFastPagination.pageSize
        )
      }
      return []
    })

    const regionSlowStatsPaginated = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.regionSlowStats) {
        return loadingTimeData.value.regionSlowStats.slice(
          (regionSlowPagination.currentPage - 1) *
            regionSlowPagination.pageSize,
          regionSlowPagination.currentPage * regionSlowPagination.pageSize
        )
      }
      return []
    })

    const regionFastStatsPaginated = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.regionFastStats) {
        return loadingTimeData.value.regionFastStats.slice(
          (regionFastPagination.currentPage - 1) *
            regionFastPagination.pageSize,
          regionFastPagination.currentPage * regionFastPagination.pageSize
        )
      }
      return []
    })

    // 时间序列数据图表
    const timeSeriesChartData = computed(() => {
      if (loadingTimeData.value && loadingTimeData.value.timeSeriesData) {
        let data = loadingTimeData.value.timeSeriesData
        data = data.sort((a, b) => {
          return a.time > b.time ? 1 : -1
        })
        const labels = []
        const avgDurations = []
        const counts = []
        const isOverDays = loadingTimeData.value.isOverDays

        data.forEach((item) => {
          let f = moment(item.time).format(
            `YYYY/MM/DD dddd${isOverDays ? '' : ' HH:mm'}`
          )
          // 空格换行
          f = f.split(' ')
          labels.push(f)
          // 将毫秒转换为秒，并保留两位小数
          avgDurations.push(
            item.avgDuration !== null
              ? (item.avgDuration / 1000).toFixed(2)
              : null
          )
          // 添加请求数量数据
          counts.push(item.count || null)
        })

        return {
          labels,
          datasets: [
            {
              label: '平均加载时间(秒)',
              data: avgDurations,
              borderColor: '#409EFF',
              backgroundColor: 'rgba(64, 158, 255, 0.2)',
              yAxisID: 'y-duration',
              tension: 0.2,
              borderWidth: 2,
            },
            {
              label: '样本数量',
              data: counts,
              borderColor: '#67C23A',
              backgroundColor: 'rgba(103, 194, 58, 0.2)',
              yAxisID: 'y-count',
              tension: 0.2,
              borderWidth: 2,
            },
          ],
        }
      }
      return { labels: [], datasets: [] }
    })

    // 修改图表配置，添加双Y轴
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        'y-duration': {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '加载时间(秒)',
          },
          grid: {
            color: 'rgba(155, 155, 155, 0.2)',
          },
          ticks: {
            beginAtZero: true,
            precision: 2,
          },
        },
        'y-count': {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: '样本数量',
          },
          grid: {
            drawOnChartArea: false, // 只显示左侧Y轴的网格线
          },
          ticks: {
            beginAtZero: true,
            precision: 0,
          },
        },
        x: {
          grid: {
            color: 'rgba(155, 155, 155, 0.2)',
          },
          ticks: {
            maxRotation: 0,
          },
        },
      },
    }

    const getLoadingTimeData = (resetPage) => {
      const startTime = new Date(timeRange.value[0])
      const endTime = new Date(timeRange.value[1])
      // 如果endTime是当天，则时间是当前时间
      if (moment(endTime).isSame(moment(), 'day')) {
        endTime.setHours(new Date().getHours(), new Date().getMinutes())
      }
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      authApi
        .getLoadingTime({
          startTime: startTime,
          endTime: endTime,
          timeZone: timeZone,
        })
        .then((res) => {
          if (resetPage) {
            fastestPagination.currentPage = 1
            slowestPagination.currentPage = 1
            countrySlowPagination.currentPage = 1
            countryFastPagination.currentPage = 1
            regionSlowPagination.currentPage = 1
            regionFastPagination.currentPage = 1
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

    const roundDuration = (duration) => {
      if (duration === null || duration === undefined) return 0
      return Math.round((duration / 1000) * 100) / 100
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
      timeSeriesChartData,
      chartOptions,
      roundDuration,
      // 新增返回国家和地区统计分页
      countrySlowPagination,
      countryFastPagination,
      regionSlowPagination,
      regionFastPagination,
      countrySlowStatsPaginated,
      countryFastStatsPaginated,
      regionSlowStatsPaginated,
      regionFastStatsPaginated,
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
  height: 485px;
  box-sizing: border-box;
  padding-bottom: 10px;
}
.tooltip-content {
  text-align: left;
  max-width: 400px;
}
.word-break {
  word-break: break-all;
  white-space: normal;
  max-width: 380px;
}
.home-chart-body {
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
}
/* 最慢/最快加载时间记录的统计面板保持原高度 */
.type-2.statistics-panel {
  height: 515px;
}
</style>
