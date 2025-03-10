<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>投票列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getVoteList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入投票名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getVoteList(true)">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- 投票 -->
    <div class="mb20 list-table-body">
      <el-table height="100%" :data="voteList" row-key="_id" ref="tableRef" border>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteVote(row._id)"
              >删除</el-button
            >
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
        :pager-count="5"
        small
        v-model:current-page="params.page"
        v-model:page-size="params.size"
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
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const voteList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getVoteList = (resetPage) => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getVoteList(params)
        .then((res) => {
          voteList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'VoteAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getVoteList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'VoteEdit',
        params: {
          id,
        },
      })
    }
    const deleteVote = (row) => {
      const id = row._id
      const title = escapeHtml(row.title) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除活动：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteEvent({ id }).then(() => {
            ElMessage.success('删除成功')
            getEventList()
          })
        },
      })
        .then(() => {})
        .catch((error) => {
          console.log('Dialog closed:', error)
        })
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }
    onMounted(() => {
      initParams()
      getVoteList()
    })
    return {
      voteList,
      params,
      total,
      tableRef,
      getVoteList,
      handleAdd,
      goEdit,
      deleteVote,
    }
  },
}
</script>
<style lang=""></style>