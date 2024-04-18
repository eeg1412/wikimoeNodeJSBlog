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
        <el-table-column
          prop="name"
          label="备份名称"
          width="180"
        ></el-table-column>
        <el-table-column label="备份类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBackupType(row.type).tagType">
              {{ getBackupType(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="filename"
          label="备份文件名"
          width="200"
        ></el-table-column>
        <el-table-column label="备份文件状态" width="150">
          <template #default="{ row }">
            <el-tag :type="getFileStatus(row.fileStatus).tagType">
              {{ getFileStatus(row.fileStatus).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备份状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getBackupStatus(row.status, row.type).tagType">
              {{ getBackupStatus(row.status, row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="reason"
          label="原因"
          width="200"
        ></el-table-column>
        <el-table-column
          prop="remark"
          label="备份备注"
          width="200"
        ></el-table-column>
        <!-- createdAt -->
        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
          </template>
        </el-table-column>
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

    const getBackupType = (type) => {
      switch (type) {
        case 1:
          return { text: '备份', tagType: 'success' }
        case 2:
          return { text: '还原', tagType: 'info' }
        default:
          return { text: '', tagType: '' }
      }
    }

    const getFileStatus = (status) => {
      switch (status) {
        case 0:
          return { text: '备份中', tagType: 'warning' }
        case 1:
          return { text: '存在', tagType: 'success' }
        case 2:
          return { text: '已删除', tagType: 'danger' }
        default:
          return { text: '', tagType: '' }
      }
    }

    const getBackupStatus = (status, type) => {
      switch (status) {
        case 0:
          return { text: type === 1 ? '备份中' : '还原中', tagType: 'warning' }
        case 1:
          return { text: '成功', tagType: 'success' }
        case 2:
          return { text: '失败', tagType: 'danger' }
        default:
          return { text: '', tagType: '' }
      }
    }
    onMounted(() => {
      initParams()
      getBackupList()
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
      getBackupType,
      getFileStatus,
      getBackupStatus,
    }
  },
}
</script>
<style lang=""></style>
