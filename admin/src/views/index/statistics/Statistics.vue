<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>排名统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 访客统计 -->
    <div>
      <div class="el-descriptions__header">
        <div class="el-descriptions__title"></div>
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
        <!-- 文章阅读排行 rankData.readPostViewData -->
        <el-col :span="8" :xs="24" class="p10">
          <div class="mb10 fb">文章阅读排行</div>
          <div class="mb10">
            <el-table
              :data="rankData.readPostViewData"
              row-key="_id"
              style="width: 100%"
            >
              <el-table-column prop="title" label="标题">
                <template #default="{ row }">
                  <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                  <div>
                    <div v-if="row.type === 2">
                      {{ reduceText(row.excerpt) }}
                    </div>
                    <div v-else>
                      {{ reduceText(row.title) }}
                    </div>
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
        <!-- 文章点赞排行统计 rankData.readPostLikeData -->
        <el-col :span="8" :xs="24" class="p10">
          <div class="mb10 fb">文章点赞排行</div>
          <div class="mb10">
            <el-table
              :data="rankData.readPostLikeData"
              row-key="_id"
              style="width: 100%"
            >
              <el-table-column prop="title" label="标题">
                <template #default="{ row }">
                  <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                  <div>
                    <div v-if="row.type === 2">
                      {{ reduceText(row.excerpt) }}
                    </div>
                    <div v-else>
                      {{ reduceText(row.title) }}
                    </div>
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
        <!-- 来源排行 rankData.readReferrerData -->
        <el-col :span="8" :xs="24" class="p10">
          <div class="mb10 fb">来源排行</div>
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
        <!-- 分类排行 rankData.readPostListSortData -->
        <el-col :span="8" :xs="24" class="p10">
          <div class="mb10 fb">分类排行</div>
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
        <!-- tag排行 rankData.readPostListTagData -->
        <el-col :span="8" :xs="24" class="p10">
          <div class="mb10 fb">tag排行</div>
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
        <!-- 站内关键词排行 rankData.readPostListKeywordData -->
        <el-col :span="8" :xs="24" class="p10">
          <div class="mb10 fb">站内关键词排行</div>
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
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import moment from 'moment'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
moment.locale('zh-cn')

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

    onMounted(() => {
      getStatistics()
    })

    return {
      rankData,
      timeRangeTypeList,
      timeRangeType,
      getStatistics,
      reduceText,
    }
  },
}
</script>
<style scoped>
.home-chart-body {
  height: 200px;
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
}
</style>
