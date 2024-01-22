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
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getReaderlogList(true)"
        >
          <!-- ip -->
          <el-form-item>
            <el-input
              v-model="params.ip"
              clearable
              placeholder="请输入ip"
            ></el-input>
          </el-form-item>
          <!-- uuid -->
          <el-form-item>
            <el-input
              v-model="params.uuid"
              clearable
              placeholder="请输入uuid"
            ></el-input>
          </el-form-item>
          <!-- isBot true false -->
          <el-form-item>
            <el-select v-model="params.isBot" placeholder="机器人" clearable>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getReaderlogList(true)"
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
    <!-- 读者访问日志 -->
    <div class="mb20 list-table-body">
      <el-table
        :key="updateCount"
        height="100%"
        :data="readerlogList"
        row-key="_id"
        border
      >
        <!-- uuid -->
        <el-table-column prop="uuid" label="uuid" width="350">
          <template #default="{ row }">
            <div v-if="row.uuid">
              <div class="dib">{{ row.uuid }}</div>
              <!-- 查询按钮 -->
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('uuid', row.uuid)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
              <!-- 点击复制按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="copyToClipboard(row.uuid)"
                  ><i class="far fa-clone"></i
                ></el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 动作 action -->
        <el-table-column prop="action" label="动作" width="200" />
        <!-- 操作内容 data -->
        <el-table-column prop="data" label="操作对象内容" min-width="200">
          <template #default="{ row }">
            <div v-if="row.data">
              <!-- 如果 target targetId content 三者都有则显示跳转到对应页面的链接，否则优先显示content，没有再显示targetId -->
              <div
                v-if="
                  targetToPath(row.data.target) &&
                  row.data.targetId &&
                  row.data.content
                "
              >
                <div class="dib">{{ row.data.content }}</div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt">
                  <el-link type="primary" @click="goToBlog(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </div>
              <div v-else-if="row.data.content">
                {{ row.data.content }}
              </div>
              <div
                v-else-if="targetToPath(row.data.target) && row.data.targetId"
              >
                <div class="dib">{{ row.data.content }}</div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt">
                  <el-link type="primary" @click="goToBlog(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </div>
              <div v-else>
                {{ row.data.targetId }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- IP信息 -->
        <el-table-column prop="ip" label="IP信息" width="350">
          <template #default="{ row }">
            <div v-if="row.ip">
              <div class="dib word-break">{{ row.ip }}</div>
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
            <div>
              是否为机器人：
              <el-tag v-if="row.isBot" type="danger">是</el-tag>
              <el-tag v-else type="success">否</el-tag>
            </div>
            <div v-if="row.isBot">机器人类型：{{ row.botName }}</div>
            <!-- ua -->
            <div>UA：{{ row.deviceInfo?.ua }}</div>
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
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard,
} from '@/utils/utils'
import store from '@/store'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const readerlogList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      ip: '',
      uuid: '',
      keyword: '',
      isBot: null,
    })
    const total = ref(0)
    const updateCount = ref(0)
    const getReaderlogList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getReaderlogList(params)
        .then((res) => {
          const list = res.data.list
          // 查询action是postListArchive 时，将title中的年月提取出来，放到targetId中
          list.forEach((item) => {
            if (item.action === 'postListArchive' && item.data.content) {
              const title = item.data.content
              const year = title.slice(2, 6)
              const month = title.slice(7, 9)
              item.data.targetId = `${year}/${month}`
            }
          })
          readerlogList.value = list
          total.value = res.data.total
          updateCount.value++
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const addParamsAndSearch = (key, value) => {
      params[key] = value
      getReaderlogList(true)
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
        params.ip = sessionParams.ip
        params.uuid = sessionParams.uuid
        params.isBot = sessionParams.isBot
      }
    }
    const targetToPath = (target) => {
      const targetMap = {
        blog: '/post/{id}',
        tweet: '/post/{id}',
        page: '/page/{id}',
        sort: '/post/list/sort/{id}/1',
        tag: '/post/list/tag/{id}/1',
        archive: '/post/list/archive/{id}/1',
      }
      if (targetMap[target]) {
        return targetMap[target]
      } else {
        return null
      }
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const getPath = (row) => {
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      let path = targetToPath(row.data.target)
      if (!path) {
        return
      }
      let targetId = row.data.targetId
      path = path.replace('{id}', targetId)

      return siteUrl.value + path
    }
    const goToBlog = (row) => {
      const url = getPath(row)
      window.open(url, '_blank')
    }

    onMounted(() => {
      initParams()
      getReaderlogList()
    })
    return {
      copyToClipboard,
      readerlogList,
      params,
      total,
      updateCount,
      getReaderlogList,
      targetToPath,
      // 搜索
      addParamsAndSearch,
      goToBlog,
    }
  },
}
</script>
<style scoped></style>
