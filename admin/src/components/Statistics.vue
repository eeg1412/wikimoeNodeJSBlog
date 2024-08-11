<template>
  <div>
    <div class="el-descriptions__header">
      <div class="el-descriptions__title">排名统计</div>
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
          @change="getStatistics"
        />
      </div>
    </div>
    <el-row v-if="rankData">
      <!-- 文章阅读 rankData.readPostViewData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb">文章阅读</div>
        <div class="mb10">
          <el-table
            :data="rankData.readPostViewData"
            row-key="_id"
            style="width: 100%"
          >
            <el-table-column prop="title" label="标题">
              <template #default="{ row }">
                <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                <div class="di">
                  <template v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </template>
                  <template v-else>
                    {{ reduceText(row.title) }}
                  </template>
                </div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt">
                  <el-link type="primary" @click="openPage(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              label="阅读量"
              width="80px"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- 文章点赞统计 rankData.readPostLikeData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb">文章点赞</div>
        <div class="mb10">
          <el-table
            :data="rankData.readPostLikeData"
            row-key="_id"
            style="width: 100%"
          >
            <el-table-column prop="title" label="标题">
              <template #default="{ row }">
                <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                <div class="di">
                  <template v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </template>
                  <template v-else>
                    {{ reduceText(row.title) }}
                  </template>
                </div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt">
                  <el-link type="primary" @click="openPage(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              label="点赞量"
              width="80px"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- 来源 rankData.readReferrerData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb">来源</div>
        <div class="mb10">
          <el-table
            :data="rankData.readReferrerData"
            row-key="_id"
            style="width: 100%"
          >
            <el-table-column prop="_id" label="来源"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- 分类 rankData.readPostListSortData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb">分类</div>
        <div class="mb10">
          <el-table
            :data="rankData.readPostListSortData"
            row-key="_id"
            style="width: 100%"
          >
            <el-table-column prop="sortname" label="分类"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- tag rankData.readPostListTagData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb">标签</div>
        <div class="mb10">
          <el-table
            :data="rankData.readPostListTagData"
            row-key="_id"
            style="width: 100%"
          >
            <el-table-column prop="tagname" label="标签"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- 站内关键词 rankData.readPostListKeywordData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb">站内关键词</div>
        <div class="mb10">
          <el-table
            :data="rankData.readPostListKeywordData"
            row-key="_id"
            style="width: 100%"
          >
            <el-table-column prop="_id" label="关键词"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import { generateRandomAlphabetString } from '@/utils/utils'
import { authApi } from '@/api'
import moment from 'moment'
import store from '@/store'

export default {
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
      // 过去3天
      {
        text: '过去3天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
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
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
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

    const rankData = ref(null)
    const getStatistics = () => {
      const startTime = new Date(timeRange.value[0])
      const endTime = new Date(timeRange.value[1])
      // 如果endTime是当天，则时间是当前时间
      if (moment(endTime).isSame(moment(), 'day')) {
        endTime.setHours(new Date().getHours(), new Date().getMinutes())
      }
      authApi
        .getStatistics({
          startTime: startTime,
          endTime: endTime,
        })
        .then((res) => {
          rankData.value = res.data
        })
    }

    // 缩减文字到20字的方法
    const reduceText = (text) => {
      if (text.length > 20) {
        return text.substring(0, 20) + '...'
      }
      return text
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const openPage = (row) => {
      const path = getPostPagePath(row)
      // 使用 window.open 方法在新窗口中打开 URL
      window.open(path, '_blank')
    }
    const getPostPagePath = (row) => {
      // 先判断type是1，2还是3，1和2跳转到/post/id，3跳转到/page/id
      // 如果有别名，就跳转到别名，没有别名就跳转到id
      let path
      if (row.type === 1 || row.type === 2) {
        path = '/post/'
      } else if (row.type === 3) {
        path = '/page/'
      } else {
        console.error('Invalid row type:', row.type)
        return
      }

      if (row.alias) {
        path += row.alias
      } else {
        path += row._id
      }
      return siteUrl.value + path
    }

    onMounted(() => {
      getStatistics()
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

      rankData,
      getStatistics,
      reduceText,
      openPage,
    }
  },
}
</script>
<style scoped></style>
