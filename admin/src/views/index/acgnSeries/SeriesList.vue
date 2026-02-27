<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>系列列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getSeriesList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键词"
              style="width: 200px"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getSeriesList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <div class="mb20 list-table-body">
      <ResponsiveTable
        ref="tableRef"
        height="100%"
        :data="seriesList"
        row-key="_id"
        border
      >
        <ResponsiveTableColumn prop="name" label="名称" min-width="200px" />
        <ResponsiveTableColumn label="别名" min-width="200px">
          <template #default="{ row }">
            <el-tag
              v-for="(item, index) in row.alias"
              :key="index"
              class="mr5 mb5"
              size="small"
            >
              {{ item }}
            </el-tag>
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="简介" min-width="200px">
          <template #default="{ row }">
            <span class="summary-cell">{{ row.summary }}</span>
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="番剧" width="70" align="center">
          <template #default="{ row }">
            {{ row.bangumiCount || 0 }}
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="电影" width="70" align="center">
          <template #default="{ row }">
            {{ row.movieCount || 0 }}
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="书籍" width="70" align="center">
          <template #default="{ row }">
            {{ row.bookCount || 0 }}
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="游戏" width="70" align="center">
          <template #default="{ row }">
            {{ row.gameCount || 0 }}
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteSeries(row)"
              >删除</el-button
            >
          </template>
        </ResponsiveTableColumn>
      </ResponsiveTable>
    </div>
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
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const seriesList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: ''
    })
    const total = ref(0)
    const tableRef = ref(null)

    const getSeriesList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getAcgnSeriesList(params)
        .then(res => {
          seriesList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }

    const handleAdd = () => {
      router.push({ name: 'AcgnSeriesAdd' })
    }

    watch(
      () => params.page,
      () => {
        getSeriesList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'AcgnSeriesEdit',
        params: { id }
      })
    }

    const deleteSeries = row => {
      const id = row._id
      const name = escapeHtml(row.name) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除系列：【${name}】</span>，并清除所有关联项目的系列引用，是否继续?`,
        success: () => {
          return authApi.deleteAcgnSeries({ id }).then(() => {
            ElMessage.success('删除成功')
            getSeriesList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
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
      getSeriesList()
    })

    return {
      seriesList,
      params,
      total,
      tableRef,
      getSeriesList,
      handleAdd,
      goEdit,
      deleteSeries
    }
  }
}
</script>
<style scoped>
.summary-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
