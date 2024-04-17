<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>备份列表</el-breadcrumb-item>
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
          @keypress.enter="getBackupList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入备份名称"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getBackupList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">备份</el-button>
      </div>
    </div>
    <!-- 备份 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="backupList"
        row-key="_id"
        ref="tableRef"
        border
      >
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteBackup(row._id)"
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
    <BackupEditor ref="BackupEditorRef" />
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import BackupEditor from '@/components/BackupEditor.vue'
export default {
  components: {
    BackupEditor,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const backupList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getBackupList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getBackupList(params)
        .then((res) => {
          backupList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const BackupEditorRef = ref(null)
    const handleAdd = () => {
      BackupEditorRef.value.open()
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getBackupList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'BackupEdit',
        params: {
          id,
        },
      })
    }
    const deleteBackup = (id) => {
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
            .deleteBackup(params)
            .then(() => {
              ElMessage.success('删除成功')
              getBackupList()
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
      }
    }
    onMounted(() => {
      initParams()
      // getBackupList()
    })
    return {
      backupList,
      params,
      total,
      tableRef,
      getBackupList,
      BackupEditorRef,
      handleAdd,
      goEdit,
      deleteBackup,
    }
  },
}
</script>
<style lang=""></style>
