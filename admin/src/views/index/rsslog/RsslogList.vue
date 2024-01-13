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
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
      </div>
    </div>
    <!-- RSS访问记录 -->
    <div class="mb20">
      <el-table :data="rsslogList" row-key="_id" border>
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
        <el-table-column prop="reader" label="阅读器" min-width="200">
          <template #default="{ row }">
            <div>{{ row.reader }}</div>
          </template>
        </el-table-column>
        <!-- rssPath -->
        <el-table-column prop="rssPath" label="RSS路径" min-width="66">
          <template #default="{ row }">
            <div>{{ row.rssPath }}</div>
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
    const rsslogList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getRsslogList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getRsslogList(params)
        .then((res) => {
          rsslogList.value = res.data.list
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
        getRsslogList()
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
      getRsslogList()
    })
    return {
      rsslogList,
      params,
      total,
      getRsslogList,
    }
  },
}
</script>
<style lang=""></style>
