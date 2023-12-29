<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>引用记录列表</el-breadcrumb-item>
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
          @keypress.enter="getReferrerList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入域名关键字"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getReferrerList(true)"
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
    <!-- 引用记录 -->
    <div class="mb20">
      <el-table :data="referrerList" row-key="_id" border>
        <!-- 来源 referrer -->
        <el-table-column prop="referrer" label="来源">
          <template #default="{ row }">
            <a :href="row.referrer" target="_blank">{{ row.referrer }}</a>
          </template>
        </el-table-column>
        <!-- 来源类型 referrerType -->
        <el-table-column prop="referrerType" label="来源类型">
          <template #default="{ row }">
            {{ row.referrerType }}
          </template>
        </el-table-column>
        <!-- 日期 creatAt -->
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
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
    const referrerList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getReferrerList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getReferrerList(params)
        .then((res) => {
          referrerList.value = res.data.list
          total.value = res.data.total
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'ReferrerAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getReferrerList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'ReferrerEdit',
        params: {
          id,
        },
      })
    }
    const deleteReferrer = (id) => {
      ElMessageBox.confirm('确定要删除吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id,
          }
          authApi
            .deleteReferrer(params)
            .then(() => {
              ElMessage.success('删除成功')
              getReferrerList()
            })
            .catch(() => {})
        })
        .catch(() => {})
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
      getReferrerList()
    })
    return {
      referrerList,
      params,
      total,
      getReferrerList,
      handleAdd,
      goEdit,
      deleteReferrer,
    }
  },
}
</script>
<style lang=""></style>
