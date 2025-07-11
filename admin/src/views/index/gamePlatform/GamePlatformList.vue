<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>游戏平台列表</el-breadcrumb-item>
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
          @keypress.enter="getGamePlatformList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入游戏平台名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getGamePlatformList(true)"
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
    <!-- 游戏平台 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="gamePlatformList"
        row-key="_id"
        ref="tableRef"
        border
      >
        <!-- 名称 -->
        <el-table-column prop="name" label="名称" min-width="200" />
        <!-- 颜色 -->
        <el-table-column prop="color" label="颜色" width="100">
          <template #default="{ row }">
            <div
              :style="{ background: row.color }"
              class="game-platform-list-block"
            >
              {{ row.color }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="deleteGamePlatform(row)"
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
    <GamePlatformEditor
      ref="GamePlatformEditorRef"
      :id="activeId"
      @update="getGamePlatformList()"
    />
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import GamePlatformEditor from '@/components/GamePlatformEditor.vue'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  components: {
    GamePlatformEditor
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const gamePlatformList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getGamePlatformList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getGamePlatformList(params)
        .then(res => {
          gamePlatformList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }
    const GamePlatformEditorRef = ref(null)
    const activeId = ref('')
    const handleAdd = () => {
      activeId.value = ''
      nextTick(() => {
        GamePlatformEditorRef.value.open()
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getGamePlatformList()
      }
    )

    const goEdit = id => {
      activeId.value = id
      nextTick(() => {
        GamePlatformEditorRef.value.open()
      })
    }
    const deleteGamePlatform = row => {
      const id = row._id
      const title = escapeHtml(row.name) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除游戏平台：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteGamePlatform({ id }).then(() => {
            ElMessage.success('删除成功')
            getGamePlatformList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
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
      getGamePlatformList()
    })
    return {
      gamePlatformList,
      params,
      total,
      tableRef,
      getGamePlatformList,
      GamePlatformEditorRef,
      activeId,
      handleAdd,
      goEdit,
      deleteGamePlatform
    }
  }
}
</script>
<style scoped>
.game-platform-list-block {
  padding: 2px 5px;
  color: #fff;
}
</style>
