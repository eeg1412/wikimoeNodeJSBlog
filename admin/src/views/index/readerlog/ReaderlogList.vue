<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>读者日志列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- 读者日志 -->
    <div class="mb20">
      <el-table :data="readerlogList" row-key="_id" border>
        <!-- uuid -->
        <el-table-column prop="uuid" label="uuid" width="315" />
        <!-- 动作 action -->
        <el-table-column prop="action" label="动作" width="200" />
        <!-- 操作内容 data -->
        <el-table-column prop="data" label="操作内容" />
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
        <el-table-column label="UA信息" width="180">
          <template #default="{ row }">
            <div>
              {{ row.deviceInfo?.os?.name }} {{ row.deviceInfo?.os?.version }}
            </div>
            <div>
              {{ row.deviceInfo?.browser?.name }}
              {{ row.deviceInfo?.browser?.version }}
            </div>
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
    const readerlogList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getReaderlogList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getReaderlogList(params)
        .then((res) => {
          readerlogList.value = res.data.list
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
        getReaderlogList()
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
    onMounted(() => {
      initParams()
      getReaderlogList()
    })
    return {
      readerlogList,
      params,
      total,
      getReaderlogList,
    }
  },
}
</script>
<style lang=""></style>
