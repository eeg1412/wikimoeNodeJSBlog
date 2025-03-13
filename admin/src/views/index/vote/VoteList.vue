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
            <el-button type="primary" @click="getVoteList(true)"
              >搜索</el-button
            >
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
      <el-table
        height="100%"
        :data="listCom"
        row-key="_id"
        ref="tableRef"
        default-expand-all
        border
      >
        <!-- title -->
        <el-table-column prop="title" label="标题/内容" min-width="200" />
        <!-- 投票数 votes -->
        <el-table-column prop="votes" label="投票数" width="200">
          <template #default="{ row }">
            <div v-if="row.isParent === true">{{ row.votes || 0 }}</div>
            <div class="vote-item-votes" v-else>
              <span class="vote-item-votes-text"
                >{{ row.votes || 0
                }}<template v-if="row.percent">
                  ({{ row.percent }})</template
                ></span
              >
              <!-- bar -->
              <div class="vote-item-votes-bar" v-if="row.percent">
                <div
                  class="vote-item-votes-bar-inner"
                  :style="{ width: row.percent }"
                ></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- maxSelect -->
        <el-table-column
          prop="maxSelect"
          label="最多可选择的选项数"
          width="200"
        />
        <!-- showResultAfter -->
        <el-table-column
          prop="showResultAfter"
          label="投票后才显示结果"
          width="200"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.isParent === true"
              :type="row.showResultAfter === true ? 'success' : 'danger'"
              size="small"
              >{{ row.showResultAfter === true ? '是' : '不是' }}</el-tag
            >
          </template>
        </el-table-column>
        <!-- endTime -->
        <el-table-column prop="endTime" label="结束时间" width="200">
          <template #default="{ row }">
            {{ $formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <!-- 排序 sort -->
        <el-table-column prop="sort" label="排序" width="100" />
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row.isParent === true"
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
              >{{ row.status === 1 ? '显示' : '不显示' }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <template v-if="row.isParent === true">
              <el-button type="primary" size="small" @click="goEdit(row._id)"
                >编辑</el-button
              >
              <el-button type="danger" size="small" @click="deleteVote(row)"
                >删除</el-button
              >
            </template>
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
import { onMounted, reactive, ref, watch, computed } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const voteList = ref([])
    const listCom = computed(() => {
      // 将options转换为children
      return voteList.value.map((item) => {
        const votes = item.votes || 0
        item.options.forEach((option) => {
          const optionVotes = option.votes || 0
          // 计算百分比
          option.percent =
            (votes ? ((optionVotes / votes) * 100).toFixed(0) : '0') + '%'
        })
        return {
          isParent: true,
          ...item,
          children: item.options,
        }
      })
    })
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
      const title = escapeHtml(row.title || '') || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除活动：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteVote({ id }).then(() => {
            ElMessage.success('删除成功')
            getVoteList()
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
      listCom,
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
<style scoped>
.vote-item-votes {
  position: relative;
  z-index: 1;
  border-width: 1px;
  border-style: solid;
  border-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  padding: 0 9px;
  border-radius: 4px;
}
.vote-item-votes-text {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}
.vote-item-votes-bar {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}
.vote-item-votes-bar-inner {
  width: 0%;
  height: 100%;
  background-color: var(--el-color-primary-light-9);
  transition: width 0.3s;
}
</style>
