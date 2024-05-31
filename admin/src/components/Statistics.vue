<template>
  <div>
    <div class="el-descriptions__header">
      <div class="el-descriptions__title">排名统计</div>
      <div class="el-descriptions__extra">
        <el-select
          v-model="timeRangeType"
          placeholder="请选择时间范围"
          @change="getStatistics"
          style="width: 120px"
        >
          <el-option
            v-for="item in timeRangeTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
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
                <div class="dib">
                  <div v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </div>
                  <div v-else>
                    {{ reduceText(row.title) }}
                  </div>
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
                <div class="dib">
                  <div v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </div>
                  <div v-else>
                    {{ reduceText(row.title) }}
                  </div>
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
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import store from '@/store'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const timeRangeTypeList = [
      { value: 'today', label: '今天' },
      { value: 'yesterday', label: '昨天' },
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' },
      { value: 'year', label: '过去一年' },
    ]
    const timeRangeType = ref('today')
    const rankData = ref(null)
    const getStatistics = () => {
      authApi
        .getStatistics({
          timeRangeType: timeRangeType.value,
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
    })

    return {
      rankData,
      timeRangeTypeList,
      timeRangeType,
      getStatistics,
      reduceText,
      openPage,
    }
  },
}
</script>
<style scoped></style>
