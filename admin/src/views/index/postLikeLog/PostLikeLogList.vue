<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>文章点赞记录列表</el-breadcrumb-item>
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
          @keypress.enter="getPostLikeLogList(true)"
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

          <el-form-item>
            <el-button type="primary" @click="getPostLikeLogList(true)"
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
    <!-- 文章点赞记录 -->
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="postLikeLogList"
        row-key="_id"
        border
      >
        <el-table-column label="文章/推文" min-width="180">
          <template #default="{ row }">
            <div :title="row.post.title || row.post.excerpt" class="dib">
              {{ titleLimit(row.post.title || row.post.excerpt) }}
            </div>
            <!-- 点击打开按钮 -->
            <div class="dib ml5 vt">
              <el-link type="primary" @click="goToBlog(row)"
                ><i class="fas fa-external-link-alt"></i
              ></el-link>
            </div>
          </template>
        </el-table-column>
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
        <!-- like 内容用tag -->
        <el-table-column prop="like" label="点赞" width="100">
          <template #default="{ row }">
            <!-- 根据like -->
            <el-tag
              v-if="row.like"
              type="success"
              effect="dark"
              style="margin-right: 5px"
            >
              点赞
            </el-tag>
            <el-tag
              v-else
              type="danger"
              effect="dark"
              style="margin-right: 5px"
            >
              取消点赞
            </el-tag>
          </template>
        </el-table-column>
        <!-- 时间date -->
        <el-table-column prop="date" label="时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
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
            <!-- ua -->
            <div>UA：{{ row.deviceInfo?.ua }}</div>
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
    const postLikeLogList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      ip: '',
      uuid: '',
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getPostLikeLogList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getPostLikeLogList(params)
        .then((res) => {
          postLikeLogList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const addParamsAndSearch = (key, value) => {
      params[key] = value
      getPostLikeLogList(true)
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getPostLikeLogList()
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
      }
    }
    const titleLimit = (title) => {
      let title_ = Array.from(title || '')
      if (title_.length > 20) {
        title_ = title_.slice(0, 20).join('') + '...'
      } else {
        title_ = title_.join('')
      }
      return title_
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const getPath = (row) => {
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      let path
      const post = row.post
      if (post.type === 1 || post.type === 2) {
        path = '/post/'
      } else if (post.type === 3) {
        path = '/page/'
      } else {
        console.error('Invalid row type:', post.type)
        return
      }

      if (post.alias) {
        path += post.alias
      } else {
        path += post._id
      }
      return siteUrl.value + path
    }
    const goToBlog = (row) => {
      const url = getPath(row)
      window.open(url, '_blank')
    }

    onMounted(() => {
      initParams()
      getPostLikeLogList()
    })
    return {
      copyToClipboard,
      postLikeLogList,
      params,
      total,
      tableRef,
      getPostLikeLogList,
      titleLimit,
      // 搜索
      addParamsAndSearch,
      goToBlog,
    }
  },
}
</script>
<style lang=""></style>
