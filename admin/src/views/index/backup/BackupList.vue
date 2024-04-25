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
          @keypress.enter="getBackupList(false)"
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
        <!-- 刷新 -->
        <el-button @click="getBackupList(true)">
          <el-icon><Refresh /></el-icon>
        </el-button>

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
          min-width="180"
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
          min-width="200"
        ></el-table-column>
        <el-table-column label="备份文件状态" width="150">
          <template #default="{ row }">
            <el-tag
              :type="getFileStatus(row.fileStatus).tagType"
              v-if="row.type !== 2"
            >
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
          min-width="200"
        ></el-table-column>
        <!-- createdAt -->
        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <div class="dflex flexMiddle">
              <div>
                <el-button
                  type="primary"
                  class="mr5"
                  size="small"
                  @click="goEdit(row._id)"
                  >编辑</el-button
                >
              </div>

              <el-dropdown
                split-button
                size="small"
                type="danger"
                trigger="click"
                @click="deleteBackup(row._id, '1', '1')"
                @command="(command) => deleteCommand(row._id, command)"
                v-if="row.type === 1 && row.fileStatus === 1"
              >
                完整删除
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="file">删除文件</el-dropdown-item>
                    <el-dropdown-item command="record"
                      >删除记录</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <div v-else>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteBackup(row._id, '0', '1')"
                  >删除记录</el-button
                >
              </div>
            </div>
            <div class="dflex flexMiddle mt5">
              <!-- 下载 -->
              <div>
                <el-button
                  class="mr5"
                  size="small"
                  @click="downloadBackup(row._id)"
                  v-if="row.fileStatus === 1"
                  >下载</el-button
                >
              </div>
              <!-- 还原 -->
              <div>
                <el-button
                  type="danger"
                  size="small"
                  @click="showBackupDialog(row._id)"
                  v-if="row.type === 1 && row.fileStatus === 1"
                  >还原</el-button
                >
              </div>
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
        :pager-count="5"
        small
        v-model:current-page="params.page"
        v-model:page-size="params.size"
      />
    </div>
    <BackupEditor
      ref="BackupEditorRef"
      :id="editId"
      @update="getBackupList(true)"
    />
    <el-dialog
      title="注意"
      v-model="isBackupDialogVisible"
      destroy-on-close
      :close-on-click-modal="false"
      align-center
      class="common-max-dialog"
    >
      <ul>
        <li>注意该操作将会<span class="cRed">删除所有现有内容！</span></li>
        <li>在还原前必须<span class="cRed">关闭博客访问！</span></li>
        <li>在还原期间管理员账号可能会无法登录！</li>
        <li>确定要还原吗？</li>
      </ul>
      <div class="mt10">
        <el-checkbox v-model="isBackupNoticeChecked">我已知晓</el-checkbox>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isBackupDialogVisible = false">取消</el-button>
          <el-button
            type="danger"
            :disabled="!isBackupNoticeChecked"
            @click="confirmBackupRestore"
          >
            执行
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
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
      editId.value = null
      nextTick(() => {
        BackupEditorRef.value.open()
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getBackupList()
      }
    )

    const editId = ref(null)
    const goEdit = (id) => {
      editId.value = id
      nextTick(() => {
        BackupEditorRef.value.open()
      })
    }
    const deleteCommand = (id, command) => {
      switch (command) {
        case 'file':
          deleteBackup(id, '1', '0')
          break
        case 'record':
          deleteBackup(id, '0', '1')
          break

        default:
          break
      }
    }
    const deleteBackup = (id, deletefile, deleterecord) => {
      // 根据deletefile和deleterecord显示不同的提示
      let note = ''
      if (deletefile === '1' && deleterecord === '1') {
        note = '删除文件和记录'
      } else if (deletefile === '1') {
        note = '删除文件'
      } else if (deleterecord === '1') {
        note = '删除记录'
      }
      ElMessageBox.confirm(`确定要${note}吗？`, {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id,
            deletefile,
            deleterecord,
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

    // 下载
    const downloadBackup = (id) => {
      authApi
        .getDownloadBackupToken({ id })
        .then((res) => {
          const token = res.data.token
          const form = document.createElement('form')
          form.action = '/api/admin/backup/download' // your url
          form.method = 'POST'
          form.target = '_blank' // open in a new tab

          // add parameters
          const input1 = document.createElement('input')
          input1.type = 'hidden'
          input1.name = 't'
          input1.value = token
          form.appendChild(input1)

          // append form to body and submit
          document.body.appendChild(form)
          form.submit()

          // remove form from body
          document.body.removeChild(form)
        })
        .catch((err) => {
          console.error(err)
        })
    }

    // 还原
    const isBackupDialogVisible = ref(false)
    const isBackupNoticeChecked = ref(false)
    const restoreId = ref(null)

    const showBackupDialog = (id) => {
      restoreId.value = id
      isBackupNoticeChecked.value = false
      isBackupDialogVisible.value = true
      restoreId.value = id
    }

    const confirmBackupRestore = () => {
      authApi
        .restoreBackup({ id: restoreId.value })
        .then(() => {
          ElMessage.success('开始还原，请稍后查看状态')
          getBackupList()
        })
        .catch(() => {})
      isBackupDialogVisible.value = false
    }

    const closeBackupDialog = (done) => {
      isBackupDialogVisible.value = false
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
      editId,
      goEdit,
      deleteCommand,
      deleteBackup,
      getBackupType,
      getFileStatus,
      getBackupStatus,
      downloadBackup,
      // 还原
      isBackupDialogVisible,
      isBackupNoticeChecked,
      showBackupDialog,
      confirmBackupRestore,
      closeBackupDialog,
    }
  },
}
</script>
<style lang=""></style>
