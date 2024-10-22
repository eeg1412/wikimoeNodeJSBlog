<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>游戏列表</el-breadcrumb-item>
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
          @keypress.enter="getGameList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入游戏名称"
              clearable
            ></el-input>
          </el-form-item>
          <!-- 游戏平台 -->
          <el-form-item>
            <el-select
              v-model="params.gamePlatform"
              placeholder="请选择游戏平台"
              clearable
              style="width: 200px"
              multiple
              filterable
              remote
              :automatic-dropdown="true"
              :remote-method="queryGamePlatformList"
              :loading="gamePlatformListIsLoading"
            >
              <el-option
                v-for="item in gamePlatformList"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 状态 0不显示 1显示 -->
          <el-form-item>
            <el-select
              v-model="params.status"
              placeholder="请选择状态"
              style="width: 100px"
              clearable
            >
              <el-option label="显示" :value="1"></el-option>
              <el-option label="不显示" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getGameList(true)"
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
    <!-- 游戏 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="gameList"
        row-key="_id"
        ref="tableRef"
        border
      >
        <!-- 封面 cover -->
        <el-table-column label="封面" width="90">
          <template #default="{ row }">
            <!-- el-image -->
            <el-image
              v-if="row.cover"
              style="width: 64px; height: 64px"
              :src="row.cover"
              fit="contain"
              :preview-src-list="[row.cover]"
              :preview-teleported="true"
            ></el-image>
          </template>
        </el-table-column>
        <!-- 标题 title -->
        <el-table-column prop="title" label="标题" min-width="200px" />
        <!-- 平台 -->
        <el-table-column label="平台" width="100px">
          <template #default="{ row }">
            <div
              :style="{ backgroundColor: row.gamePlatform.color }"
              class="game-platform-block"
              v-if="row.gamePlatform"
            >
              {{ row.gamePlatform.name }}
            </div>
          </template>
        </el-table-column>
        <!-- 简评 -->
        <el-table-column prop="summary" label="简评" min-width="250px" />
        <!-- 评分 rating -->
        <el-table-column prop="rating" label="评分" width="60px" />
        <!-- 标记 字符串数组 label -->
        <el-table-column prop="label" label="标记" min-width="140px">
          <template #default="{ row }">
            <el-tag v-for="item in row.label" :key="item" type="success">{{
              item
            }}</el-tag>
          </template>
        </el-table-column>
        <!-- 截图相册 -->
        <el-table-column
          prop="screenshotAlbum.name"
          label="截图相册"
          width="100px"
        />
        <!-- urlList 附加链接列表 -->
        <el-table-column prop="urlList" label="附加链接" min-width="150px">
          <template #default="{ row }">
            <div v-for="(item, index) in row.urlList" :key="index">
              <el-link
                :href="item.url"
                target="_blank"
                type="primary"
                :underline="false"
                >{{ item.text }}</el-link
              >
            </div>
          </template>
        </el-table-column>
        <!-- 游戏时间 -->
        <el-table-column label="游戏时间" width="320px">
          <template #default="{ row }">
            <span v-if="row.startTime || row.endTime"
              >{{ $formatDate(row.startTime) }} ~
              {{ $formatDate(row.endTime) }}</span
            >
          </template>
        </el-table-column>
        <!-- giveUp 已弃坑 -->
        <el-table-column label="弃坑" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.giveUp" type="danger">已弃坑</el-tag>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">显示</el-tag>
            <el-tag v-else type="danger">不显示</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteGame(row._id)"
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
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const gameList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      gamePlatform: '',
      status: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getGameList = (resetPage) => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getGameList(params)
        .then((res) => {
          gameList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'GameAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getGameList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'GameEdit',
        params: {
          id,
        },
      })
    }
    const deleteGame = (id) => {
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
            .deleteGame(params)
            .then(() => {
              ElMessage.success('删除成功')
              getGameList()
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
        params.gamePlatform = sessionParams.gamePlatform
        params.status = sessionParams.status
        if (params.gamePlatform) {
          queryGamePlatformList(null, {
            idList: params.gamePlatform,
            size: 999999,
          })
        }
      }
    }

    // 游戏平台列表
    const gamePlatformList = ref([])
    const gamePlatformListIsLoading = ref(false)
    const gamePlatformListTimer = null
    const queryGamePlatformList = (query, options = {}) => {
      if (gamePlatformListTimer) {
        clearTimeout(gamePlatformListTimer)
      }
      setTimeout(() => {
        gamePlatformListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
          ...options,
        }
        authApi
          .getGamePlatformList(params, { noLoading: true })
          .then((res) => {
            gamePlatformList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            gamePlatformListIsLoading.value = false
          })
      }, 300)
    }
    onMounted(() => {
      initParams()
      getGameList()
    })
    return {
      gameList,
      params,
      total,
      tableRef,
      getGameList,
      handleAdd,
      goEdit,
      deleteGame,
      gamePlatformList,
      gamePlatformListIsLoading,
      queryGamePlatformList,
    }
  },
}
</script>
<style scoped>
.game-platform-block {
  display: inline-block;
  padding: 2px 6px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}
</style>
