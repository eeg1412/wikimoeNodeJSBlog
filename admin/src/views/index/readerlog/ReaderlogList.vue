<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>读者访问日志列表</el-breadcrumb-item>
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
    <!-- 读者访问日志 -->
    <div class="mb20">
      <el-table :data="readerlogList" row-key="_id" border>
        <!-- uuid -->
        <el-table-column prop="uuid" label="uuid" width="315" />
        <!-- 动作 action -->
        <el-table-column prop="action" label="动作" width="200" />
        <!-- 操作内容 data -->
        <el-table-column prop="data" label="操作对象内容" min-width="200">
          <template #default="{ row }">
            <div v-if="row.data">
              <!-- 如果 target targetId content 三者都有则显示跳转到对应页面的链接，否则优先显示content，没有再显示targetId -->
              <div
                v-if="
                  targetToName(row.data.target) &&
                  row.data.targetId &&
                  row.data.content
                "
              >
                <router-link
                  :to="{
                    name: targetToName(row.data.target),
                    params: { id: row.data.targetId },
                  }"
                  >{{ row.data.content }}</router-link
                >
              </div>
              <div v-else-if="row.data.content">
                {{ row.data.content }}
              </div>
              <div
                v-else-if="targetToName(row.data.target) && row.data.targetId"
              >
                <router-link
                  :to="{
                    name: targetToName(row.data.target),
                    params: { id: row.data.targetId },
                  }"
                  >{{ row.data.targetId }}</router-link
                >
              </div>
              <div v-else>
                {{ row.data.targetId }}
              </div>
            </div>
          </template>
        </el-table-column>
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
        <el-table-column label="UA信息" width="210">
          <template #default="{ row }">
            <div>系统：{{ row.deviceInfo?.os?.name }}</div>
            <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
            <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
            <div>浏览器版本号： {{ row.deviceInfo?.browser?.version }}</div>
          </template>
        </el-table-column>
        <!-- 来源 referrer -->
        <el-table-column prop="referrer" label="来源" min-width="200" />
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
    const targetToName = (target) => {
      const targetMap = {
        post: 'PostEdit',
        sort: 'SortEdit',
        tag: 'TagEdit',
      }
      if (targetMap[target]) {
        return targetMap[target]
      } else {
        return null
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
      targetToName,
    }
  },
}
</script>
<style scoped></style>
