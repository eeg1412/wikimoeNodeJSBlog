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
          @change="getStatistics(true)"
        />
      </div>
    </div>
    <el-row v-if="rankData">
      <!-- 文章阅读 rankData.readPostViewData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">文章阅读</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostViewData"
            row-key="_id"
            style="width: 100%"
            height="440px"
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
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostViewData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostViewPagination.currentPage"
              v-model:page-size="readPostViewPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 文章点赞统计 rankData.readPostLikeData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">文章点赞</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostLikeData"
            row-key="_id"
            style="width: 100%"
            height="440px"
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
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostLikeData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostLikePagination.currentPage"
              v-model:page-size="readPostLikePagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 来源 rankData.readReferrerData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">来源</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readReferrerData"
            row-key="_id"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="_id" label="来源"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readReferrerData.length"
              :pager-count="5"
              small
              v-model:current-page="readReferrerPagination.currentPage"
              v-model:page-size="readReferrerPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 分类 rankData.readPostListSortData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">分类</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListSortData"
            row-key="_id"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="sortname" label="分类"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListSortData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListSortPagination.currentPage"
              v-model:page-size="readPostListSortPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- tag rankData.readPostListTagData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">标签</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListTagData"
            row-key="_id"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="tagname" label="标签"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListTagData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListTagPagination.currentPage"
              v-model:page-size="readPostListTagPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 站内关键词 rankData.readPostListKeywordData -->
      <el-col :span="8" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">站内关键词</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListKeywordData"
            row-key="_id"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="_id" label="关键词"> </el-table-column>
            <el-table-column
              prop="count"
              label="访问量"
              width="80px"
            ></el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListKeywordData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListKeywordPagination.currentPage"
              v-model:page-size="readPostListKeywordPagination.pageSize"
            />
          </div>
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

    const rankData = ref(null)
    const getStatistics = (resetPage) => {
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
          if (resetPage) {
            readPostViewPagination.currentPage = 1
            readPostLikePagination.currentPage = 1
            readReferrerPagination.currentPage = 1
            readPostListSortPagination.currentPage = 1
            readPostListTagPagination.currentPage = 1
            readPostListKeywordPagination.currentPage = 1
          }
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

    // readPostView的翻页对象
    const readPostViewPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })
    // readPostView的computed
    const readPostViewData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostViewData.slice(
          (readPostViewPagination.currentPage - 1) *
            readPostViewPagination.pageSize,
          readPostViewPagination.currentPage * readPostViewPagination.pageSize
        )
      }
      return []
    })
    // readPostLike 的翻页对象
    const readPostLikePagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })
    // readPostLike 的computed
    const readPostLikeData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostLikeData.slice(
          (readPostLikePagination.currentPage - 1) *
            readPostLikePagination.pageSize,
          readPostLikePagination.currentPage * readPostLikePagination.pageSize
        )
      }
      return []
    })
    // readReferrer 的翻页对象
    const readReferrerPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })
    // readReferrer 的computed
    const readReferrerData = computed(() => {
      if (rankData.value) {
        return rankData.value.readReferrerData.slice(
          (readReferrerPagination.currentPage - 1) *
            readReferrerPagination.pageSize,
          readReferrerPagination.currentPage * readReferrerPagination.pageSize
        )
      }
      return []
    })
    // readPostListSort
    const readPostListSortPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })
    // readPostListSort 的computed
    const readPostListSortData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostListSortData.slice(
          (readPostListSortPagination.currentPage - 1) *
            readPostListSortPagination.pageSize,
          readPostListSortPagination.currentPage *
            readPostListSortPagination.pageSize
        )
      }
      return []
    })
    // readPostListTag
    const readPostListTagPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })
    // readPostListTag 的computed
    const readPostListTagData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostListTagData.slice(
          (readPostListTagPagination.currentPage - 1) *
            readPostListTagPagination.pageSize,
          readPostListTagPagination.currentPage *
            readPostListTagPagination.pageSize
        )
      }
      return []
    })
    // readPostListKeyword
    const readPostListKeywordPagination = reactive({
      currentPage: 1,
      pageSize: 10,
    })
    // readPostListKeyword 的computed
    const readPostListKeywordData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostListKeywordData.slice(
          (readPostListKeywordPagination.currentPage - 1) *
            readPostListKeywordPagination.pageSize,
          readPostListKeywordPagination.currentPage *
            readPostListKeywordPagination.pageSize
        )
      }
      return []
    })

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

      readPostViewPagination,
      readPostViewData,
      readPostLikePagination,
      readPostLikeData,
      readReferrerPagination,
      readReferrerData,
      readPostListSortPagination,
      readPostListSortData,
      readPostListTagPagination,
      readPostListTagData,
      readPostListKeywordPagination,
      readPostListKeywordData,
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
  border: 1px solid #ebeef5;
  height: 485px;
  box-sizing: border-box;
  padding-bottom: 10px;
}
</style>
