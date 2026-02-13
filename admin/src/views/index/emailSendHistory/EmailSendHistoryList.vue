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
              clearable
              placeholder="请输入关键词"
            ></el-input>
          </el-form-item>
          <!-- 发送对象 -->
          <el-form-item>
            <el-input
              v-model="params.to"
              clearable
              placeholder="请输入发送对象"
            ></el-input>
          </el-form-item>
          <!-- status -->
          <el-form-item>
            <el-select v-model="params.status" placeholder="发送状态" clearable>
              <el-option label="发送成功" :value="1"></el-option>
              <el-option label="发送失败" :value="0"></el-option>
            </el-select>
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
    <div class="mb20 list-table-body">
      <ResponsiveTable
        ref="tableRef"
        height="100%"
        :data="emailSendHistoryList"
        row-key="_id"
        border
      >
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
        <ResponsiveTableColumn label="发送对象" prop="to" min-width="150px">
          <template #default="{ row }">
            <div v-if="row.to">
              <div class="di word-break">{{ row.to }}</div>
              <!-- 查询按钮 -->
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('to', row.to)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
              <!-- 点击复制按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="copyToClipboard(row.to)"
                  ><i class="far fa-clone"></i
                ></el-link>
              </div>
            </div>
          </template>
        </ResponsiveTableColumn>
        <!-- subject -->
        <ResponsiveTableColumn
          label="发送主题"
          prop="subject"
          min-width="150px"
        />
        <ResponsiveTableColumn label="发送内容" prop="content" width="100px">
          <template #default="{ row }">
            <!-- <div v-html="row.content"></div> -->
            <!-- 点击查看内容按钮 -->
            <el-link type="primary" @click="openHtml(row.content)"
              >查看内容</el-link
            >
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn
          label="错误信息"
          prop="errInfo"
          min-width="150px"
        ></ResponsiveTableColumn>
        <ResponsiveTableColumn label="发送状态" prop="status" width="100px">
          <template #default="{ row }">
            <!-- tag -->
            <el-tag v-if="row.status === 0" type="danger" effect="dark">
              发送失败
            </el-tag>
            <el-tag v-else-if="row.status === 1" type="success" effect="dark">
              发送成功
            </el-tag>
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="发送时间" prop="createdAt" width="180px">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
          </template>
        </ResponsiveTableColumn>
        <!-- 重新发送按钮 -->
        <ResponsiveTableColumn label="操作" width="100px">
          <template #default="{ row }">
            <!-- 重新发送 -->
            <el-button type="primary" size="small" @click="resend(row._id)"
              >重发</el-button
            >
          </template>
        </ResponsiveTableColumn>
      </ResponsiveTable>
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
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard
} from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const emailSendHistoryList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      to: '',
      status: null,
      keyword: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getEmailSendHistoryList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getEmailSendHistoryList(params)
        .then(res => {
          emailSendHistoryList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }
    const addParamsAndSearch = (key, value) => {
      params[key] = value
      getEmailSendHistoryList(true)
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getEmailSendHistoryList()
      }
    )

    const resend = id => {
      // 先询问是否重新发送
      ElMessageBox.confirm('确定要重新发送吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          authApi
            .resendEmailSendHistory({ id })
            .then(() => {
              ElMessage.success('已重新发送, 请稍后查看发送状态')
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
        params.to = sessionParams.to
        params.status = sessionParams.status
      }
    }

    const openHtml = html => {
      const newWindow = window.open(
        '',
        '_blank',
        'location=no,menubar=no,toolbar=no,dependent=yes,width=800,height=600'
      )
      newWindow.document.write(html)
    }
    onMounted(() => {
      initParams()
      getEmailSendHistoryList()
    })
    return {
      copyToClipboard,
      emailSendHistoryList,
      params,
      total,
      tableRef,
      getEmailSendHistoryList,
      resend,
      // 搜索
      addParamsAndSearch,
      openHtml
    }
  }
}
</script>
<style lang=""></style>
