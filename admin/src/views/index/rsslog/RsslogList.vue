<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>RSS访问记录列表</el-breadcrumb-item>
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
          @keypress.enter="getRsslogList(true)"
        >
          <!-- ip -->
          <el-form-item>
            <el-input
              v-model="params.ip"
              clearable
              placeholder="请输入ip"
            ></el-input>
          </el-form-item>
          <!-- rssPath -->
          <el-form-item>
            <el-input
              v-model="params.rssPath"
              clearable
              placeholder="请输入RSS路径"
            ></el-input>
          </el-form-item>
          <!-- reader -->
          <el-form-item>
            <el-input
              v-model="params.reader"
              clearable
              placeholder="请输入阅读器"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="getRsslogList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
      </div>
    </div>
    <!-- RSS访问记录 -->
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="rsslogList"
        row-key="_id"
        border
      >
        <!-- IP信息 -->
        <el-table-column prop="ip" label="IP信息" width="350">
          <template #default="{ row }">
            <div v-if="row.ip">
              <div class="di word-break">{{ row.ip }}</div>
              <!-- 查询按钮 -->
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('ip', row.ip)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
              <!-- 点击复制按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="copyToClipboard(row.ip)"
                  ><i class="far fa-clone"></i
                ></el-link>
              </div>
            </div>
            <IpInfoDisplay :ipInfo="row.ipInfo" />
          </template>
        </el-table-column>
        <!-- UA信息 -->
        <el-table-column label="UA信息" min-width="210">
          <template #default="{ row }">
            <div>系统：{{ row.deviceInfo?.os?.name }}</div>
            <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
            <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
            <div>浏览器版本号： {{ row.deviceInfo?.browser?.version }}</div>
            <!-- ua -->
            <div>UA：{{ row.deviceInfo?.ua }}</div>
          </template>
        </el-table-column>
        <!-- 阅读器 -->
        <el-table-column prop="reader" label="阅读器" min-width="300">
          <template #default="{ row }">
            <div v-if="row.reader">
              <div class="dib word-break">{{ row.reader }}</div>
              <!-- 查询按钮 -->
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('reader', row.reader)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- rssPath -->
        <el-table-column prop="rssPath" label="RSS路径" min-width="86">
          <template #default="{ row }">
            <div v-if="row.rssPath">
              <div class="di">{{ row.rssPath }}</div>
              <!-- 查询按钮 -->
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('rssPath', row.rssPath)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- createdAt -->
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
    const rsslogList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      ip: '',
      rssPath: '',
      reader: '',
      keyword: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getRsslogList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getRsslogList(params)
        .then(res => {
          rsslogList.value = res.data.list
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
      getRsslogList(true)
    }

    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getRsslogList()
      }
    )

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.ip = sessionParams.ip
        params.rssPath = sessionParams.rssPath
        params.reader = sessionParams.reader
      }
    }
    onMounted(() => {
      initParams()
      getRsslogList()
    })
    return {
      copyToClipboard,
      rsslogList,
      params,
      total,
      tableRef,
      getRsslogList,
      // 搜索
      addParamsAndSearch
    }
  }
}
</script>
<style lang=""></style>
