<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>地点</el-breadcrumb-item>
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
          @keypress.enter="getMappointList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入地点名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="params.status" placeholder="状态" clearable>
              <el-option label="不显示" :value="0"></el-option>
              <el-option label="显示" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getMappointList(true)"
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
    <!-- mappoints -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="mappointList"
        row-key="_id"
        border
        default-expand-all
        ref="tableRef"
      >
        <el-table-column prop="title" label="地点名称" min-width="100">
          <template #default="{ row }">
            <div class="di">{{ row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="简介" min-width="200">
          <template #default="{ row }">
            {{ row.summary || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="longitude" label="经度" min-width="100">
          <template #default="{ row }">
            {{ row.longitude }}
          </template>
        </el-table-column>
        <el-table-column prop="latitude" label="纬度" min-width="100">
          <template #default="{ row }">
            {{ row.latitude }}
          </template>
        </el-table-column>
        <!-- zIndex -->
        <el-table-column prop="zIndex" label="层叠顺序" min-width="100">
          <template #default="{ row }">
            {{ row.zIndex || 0 }}
          </template>
        </el-table-column>

        <!-- totalPostCount -->
        <el-table-column
          prop="totalPostCount"
          label="总文章数"
          min-width="100"
          v-if="params.shouldCount === '1'"
        >
          <template #default="{ row }">
            {{ row.totalPostCount || 0 }}
          </template>
        </el-table-column>
        <!-- publicPostCount -->
        <el-table-column
          prop="publicPostCount"
          label="公开文章数"
          min-width="100"
          v-if="params.shouldCount === '1'"
        >
          <template #default="{ row }">
            {{ row.publicPostCount || 0 }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">显示</el-tag>
            <el-tag v-else type="danger">不显示</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteMappoint(row)"
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
import { onMounted, reactive, ref, watch, computed } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import store from '@/store'
import { copyToClipboard, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const mappointList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      status: '',
      shouldCount: '1'
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getMappointList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getMappointList(params)
        .then(res => {
          mappointList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'MappointAdd'
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getMappointList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'MappointEdit',
        params: {
          id
        }
      })
    }
    const deleteMappoint = row => {
      const id = row._id
      const title = escapeHtml(row.title)

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除地点：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteMappoint({ id }).then(() => {
            ElMessage.success('删除成功')
            getMappointList()
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
        params.status = sessionParams.status
      }
    }

    onMounted(() => {
      initParams()
      getMappointList()
    })
    return {
      mappointList,
      params,
      total,
      tableRef,
      getMappointList,
      handleAdd,
      goEdit,
      deleteMappoint
    }
  }
}
</script>
<style lang=""></style>
