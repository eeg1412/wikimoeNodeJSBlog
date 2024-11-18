<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>活动类型列表</el-breadcrumb-item>
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
          @keypress.enter="getEventtypeList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入活动类型名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getEventtypeList(true)"
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
    <!-- 活动类型 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="eventtypeList"
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
              class="eventtype-list-block"
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
            <el-button type="danger" size="small" @click="deleteEventtype(row)"
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
    <EventtypeEditor
      ref="EventtypeEditorRef"
      :id="activeId"
      @update="getEventtypeList()"
    />
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import EventtypeEditor from '@/components/EventtypeEditor.vue'
import CheckDialogService from '@/services/CheckDialogService'
export default {
  components: {
    EventtypeEditor,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const eventtypeList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getEventtypeList = (resetPage) => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getEventtypeList(params)
        .then((res) => {
          eventtypeList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const EventtypeEditorRef = ref(null)
    const activeId = ref('')
    const handleAdd = () => {
      activeId.value = ''
      nextTick(() => {
        EventtypeEditorRef.value.open()
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getEventtypeList()
      }
    )

    const goEdit = (id) => {
      activeId.value = id
      nextTick(() => {
        EventtypeEditorRef.value.open()
      })
    }
    const deleteEventtype = (row) => {
      const id = row._id
      const title = escapeHtml(row.name) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除活动类型：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteEventtype({ id }).then(() => {
            ElMessage.success('删除成功')
            getEventtypeList()
          })
        },
      })
        .then(() => {})
        .catch((error) => {
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
      getEventtypeList()
    })
    return {
      eventtypeList,
      params,
      total,
      tableRef,
      getEventtypeList,
      EventtypeEditorRef,
      activeId,
      handleAdd,
      goEdit,
      deleteEventtype,
    }
  },
}
</script>
<style scoped>
.eventtype-list-block {
  padding: 2px 5px;
  color: #fff;
}
</style>
