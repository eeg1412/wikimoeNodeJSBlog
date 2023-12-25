<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>评论点赞记录列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
      </div>
    </div>
    <!-- 评论点赞记录 -->
    <div class="mb20">
      <el-table :data="commentLikeLogList" row-key="_id" border>
        <el-table-column label="评论" min-width="180">
          <template #default="{ row }">
            <div :title="row.comment.content">
              {{ row.comment.content }}
            </div>
          </template>
        </el-table-column>
        <!-- uuid -->
        <el-table-column prop="uuid" label="uuid" width="315" />
        <!-- like 内容用tag -->
        <el-table-column prop="like" label="点赞" width="100">
          <template #default="{ row }">
            <!-- 根据like -->
            <el-tag
              v-if="row.like"
              type="success"
              effect="dark"
              style="margin-right: 5px"
            >
              点赞
            </el-tag>
            <el-tag
              v-else
              type="danger"
              effect="dark"
              style="margin-right: 5px"
            >
              取消点赞
            </el-tag>
          </template>
        </el-table-column>
        <!-- 时间date -->
        <el-table-column prop="date" label="时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
          </template>
        </el-table-column>
        <!-- IP信息 -->
        <el-table-column prop="ip" label="IP信息" width="200">
          <template #default="{ row }">
            <div>
              {{ row.ip }}
            </div>
            <div>
              {{ row.ipInfo?.countryLong }} {{ row.ipInfo?.city
              }}<template v-if="row.ipInfo?.region !== row.ipInfo?.city">
                {{ ' ' + row.ipInfo?.region }}</template
              >
            </div>
          </template>
        </el-table-column>
        <!-- UA信息 -->
        <el-table-column label="UA信息" width="210">
          <template #default="{ row }">
            <div>系统：{{ row.deviceInfo?.os?.name }}</div>
            <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
            <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
            <div>浏览器版本号： {{ row.deviceInfo?.browser?.version }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="clearfix">
      <el-pagination
        class="fr"
        background
        layout="total, prev, pager, next"
        :total="total"
        v-model:current-page="params.page"
      />
    </div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const commentLikeLogList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getCommentLikeLogList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getCommentLikeLogList(params)
        .then((res) => {
          commentLikeLogList.value = res.data.list
          total.value = res.data.total
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getCommentLikeLogList()
      }
    )

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }
    const titleLimit = (title) => {
      let title_ = title || ''
      if (title_.length > 20) {
        title_ = title_.slice(0, 20) + '...'
      }
      return title_
    }
    onMounted(() => {
      initParams()
      getCommentLikeLogList()
    })
    return {
      commentLikeLogList,
      params,
      total,
      getCommentLikeLogList,
      titleLimit,
    }
  },
}
</script>
<style lang=""></style>
