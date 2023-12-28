<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>邮件发送记录列表</el-breadcrumb-item>
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
          @keypress.enter="getEmailSendHistoryList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键词"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getEmailSendHistoryList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
      </div>
    </div>
    <!-- 邮件发送记录 -->
    <div class="mb20">
      <el-table :data="emailSendHistoryList" row-key="_id" border>
        <!-- // 发送对象
        to: {
          type: String,
        },
        // 发送内容
        content: {
          type: String,
        },
        errInfo: {
          type: String,
        },
        // 发送状态 0: 发送失败 1: 发送成功
        status: {
          type: Number,
          default: 0
        }, -->
        <el-table-column label="发送对象" prop="to"></el-table-column>
        <el-table-column label="发送内容" prop="content">
          <template #default="{ row }">
            <div v-html="row.content"></div>
          </template>
        </el-table-column>
        <el-table-column label="错误信息" prop="errInfo"></el-table-column>
        <el-table-column label="发送状态" prop="status" width="100px">
          <template #default="{ row }">
            <!-- tag -->
            <el-tag v-if="row.status === 0" type="danger" effect="dark">
              发送失败
            </el-tag>
            <el-tag v-else-if="row.status === 1" type="success" effect="dark">
              发送成功
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" prop="createdAt" width="180px">
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
    const emailSendHistoryList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getEmailSendHistoryList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getEmailSendHistoryList(params)
        .then((res) => {
          emailSendHistoryList.value = res.data.list
          total.value = res.data.total
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'EmailSendHistoryAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getEmailSendHistoryList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'EmailSendHistoryEdit',
        params: {
          id,
        },
      })
    }
    const deleteEmailSendHistory = (id) => {
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
            .deleteEmailSendHistory(params)
            .then(() => {
              ElMessage.success('删除成功')
              getEmailSendHistoryList()
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
      getEmailSendHistoryList()
    })
    return {
      emailSendHistoryList,
      params,
      total,
      getEmailSendHistoryList,
      handleAdd,
      goEdit,
      deleteEmailSendHistory,
    }
  },
}
</script>
<style lang=""></style>
