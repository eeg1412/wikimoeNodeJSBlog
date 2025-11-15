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
              clearable
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
        <!-- 上传备份 -->
        <el-button type="primary" @click="openUploadDialog()"
          >上传备份</el-button
        >

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
        <!-- fileSize -->
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="{ row }">
            <span v-if="row.fileSize">{{ formatSize(row.fileSize) }}</span>
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
                @command="command => deleteCommand(row._id, command)"
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
              <!-- 续传 -->
              <div>
                <el-button
                  class="mr5"
                  size="small"
                  @click="continueUploadBackup(row._id)"
                  v-if="row.fileStatus === 3"
                  >续传</el-button
                >
              </div>
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
              <!-- 标记删除 -->
              <div>
                <el-button
                  type="danger"
                  size="small"
                  @click="markBackupFileDelete(row.name, row._id, row.__v)"
                  v-if="row.type === 1 && row.fileStatus === 99"
                  >将备份文件标记为已删除</el-button
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
        <li>在还原时<span class="cRed">博客将不可用！</span></li>
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
    <el-dialog
      title="上传备份"
      v-model="uploadDialog"
      destroy-on-close
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="!backupFileUploading"
      align-center
      class="common-max-dialog"
    >
      <div class="uploader-dialog-body">
        <div v-loading="backupFileUploading">
          <el-upload
            class="backup-uploader"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadBackup"
            accept="application/zip"
          >
            <el-button type="primary">上传文件</el-button>
            <template #tip>
              <div v-if="continueUploadId" class="mt5">
                请上传由<span class="cRed"
                  >博客备份系统生成的备份文件，非博客备份系统生成的备份文件将会造成不可预计的错误！</span
                >续传时请<span class="cRed">使用相同的文件!</span>
              </div>
              <div v-else class="mt5">
                请上传由<span class="cRed"
                  >博客备份系统生成的备份文件，非博客备份系统生成的备份文件将会造成不可预计的错误！</span
                >
              </div>
            </template>
          </el-upload>
        </div>
        <div class="mt10" v-if="backupFileUploading">
          <el-progress
            :percentage="uploadProgress"
            status="active"
            text-inside
            text="上传中"
          ></el-progress>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import BackupEditor from '@/components/BackupEditor.vue'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  components: {
    BackupEditor
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const backupList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getBackupList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getBackupList(params)
        .then(res => {
          backupList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
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
    const goEdit = id => {
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
      CheckDialogService.open({
        correctAnswer: '是',
        content: `确定要<span class="cRed">${escapeHtml(
          note || ''
        )}</span>吗？`,
        success: () => {
          const params = {
            id,
            deletefile,
            deleterecord
          }
          return authApi
            .deleteBackup(params)
            .then(() => {
              ElMessage.success('删除成功')
              getBackupList()
            })
            .catch(() => {})
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

    const getBackupType = type => {
      switch (type) {
        case 1:
          return { text: '备份', tagType: 'success' }
        case 2:
          return { text: '还原', tagType: 'info' }
        default:
          return { text: '', tagType: '' }
      }
    }

    const getFileStatus = status => {
      switch (status) {
        case 0:
          return { text: '备份中', tagType: 'warning' }
        case 1:
          return { text: '存在', tagType: 'success' }
        case 2:
          return { text: '已删除', tagType: 'danger' }
        case 3:
          return { text: '上传尚未完成', tagType: 'warning' }
        case 99:
          return { text: '文件已丢失', tagType: 'warning' }
        case 98:
          return { text: '查询文件出错', tagType: 'warning' }
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
        case 3:
          return { text: '上传尚未完成', tagType: 'warning' }
        default:
          return { text: '', tagType: '' }
      }
    }

    // 下载
    const downloadBackup = id => {
      authApi
        .getDownloadBackupToken({ id })
        .then(res => {
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
        .catch(err => {
          console.error(err)
        })
    }

    // 还原
    const isBackupDialogVisible = ref(false)
    const isBackupNoticeChecked = ref(false)
    const restoreId = ref(null)

    const showBackupDialog = id => {
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

    const closeBackupDialog = done => {
      isBackupDialogVisible.value = false
    }

    // 将字节转换成MB
    const formatSize = size => {
      if (!size) return '0 B'
      const num = 1024.0 // byte
      if (size < num) return size + ' B'
      if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + ' KB' // KB
      if (size < Math.pow(num, 3))
        return (size / Math.pow(num, 2)).toFixed(2) + ' MB' // MB
      if (size < Math.pow(num, 4))
        return (size / Math.pow(num, 3)).toFixed(2) + ' GB' // GB
      return (size / Math.pow(num, 4)).toFixed(2) + ' TB' // TB
    }

    // 上传备份
    const uploadDialog = ref(false)
    const openUploadDialog = id => {
      continueUploadId.value = id || null
      backupFileUploading.value = false
      uploadProgress.value = 0
      uploadDialog.value = true
    }
    const uploadBackup = file => {
      backupFileUploading.value = true
      // 获取文件名和文件大小
      const fileName = file.raw.name
      const fileSize = file.raw.size
      if (continueUploadId.value) {
        // 续传
        authApi
          .getBackupUploadChunkList({
            id: continueUploadId.value,
            fileSize
          })
          .then(res => {
            const uploadedFileChunkIndexList = res.data.data
            uploadFileChunk(
              {
                _id: continueUploadId.value
              },
              file.raw,
              uploadedFileChunkIndexList
            )
          })
          .catch(err => {
            console.error(err)
            backupFileUploading.value = false
          })
      } else {
        // 创建备份数据
        authApi
          .createBackupUpload({
            fileName,
            fileSize
          })
          .then(res => {
            uploadFileChunk(res.data.data, file.raw)
          })
          .catch(err => {
            console.error(err)
            backupFileUploading.value = false
          })
      }
    }
    const continueUploadId = ref(null)
    const continueUploadBackup = id => {
      openUploadDialog(id)
    }

    // 上传进度
    const uploadProgress = ref(0)
    const backupFileUploading = ref(false)
    // 上传文件切片
    const uploadFileChunk = async (
      data,
      file,
      uploadedFileChunkIndexList = []
    ) => {
      // 上传文件切片，10M
      const chunkSize = 10 * 1024 * 1024
      const chunkInfoList = []
      const chunkCount = Math.ceil(file.size / chunkSize)
      for (let i = 0; i < chunkCount; i++) {
        const start = i * chunkSize
        const end = Math.min(file.size, start + chunkSize)
        // 包含开始和结束的切片位置
        const chunkInfo = {
          start,
          end,
          index: i
        }
        chunkInfoList.push(chunkInfo)
      }
      // 根据 uploadedFileChunkIndexList 剔除已上传的切片
      const needUploadChunkList = chunkInfoList.filter(
        chunk => !uploadedFileChunkIndexList.includes(String(chunk.index))
      )
      let errorCount = 0
      //遍历 needUploadChunkList 上传切片
      for (let i = 0; i < needUploadChunkList.length; i++) {
        const chunk = needUploadChunkList[i]
        const formData = new FormData()
        formData.append('file', file.slice(chunk.start, chunk.end))
        await authApi
          .uploadBackupUploadChunk(data._id, chunk.index, formData)
          .then(res => {
            errorCount = 0
            // 进度
            uploadProgress.value = Math.ceil(
              ((uploadedFileChunkIndexList.length + 1) / chunkCount) * 100
            )
            uploadedFileChunkIndexList.push(String(chunk.index))
            // 上传完成
            if (uploadedFileChunkIndexList.length === chunkCount) {
              // 上传完成
              authApi
                .mergeUploadBackupFile({ id: data._id })
                .then(res => {
                  uploadProgress.value = 100
                  backupFileUploading.value = false
                  ElMessage.success('上传成功')
                  uploadDialog.value = false
                  getBackupList()
                })
                .catch(err => {
                  console.error(err)
                })
            }
          })
          .catch(err => {
            console.error(err)
            errorCount++
            if (errorCount > 3) {
              ElMessage.error('上传失败')
              backupFileUploading.value = false
              throw new Error('上传失败')
            } else {
              i--
            }
          })
      }
    }

    // 标记备份文件删除
    const markBackupFileDelete = (name, id, __v) => {
      // 二次确认
      CheckDialogService.open({
        correctAnswer: '是',
        content: `确定要将<span class="cRed">【${name}】</span>的<span class="cRed">备份文件标记为删除</span>吗？`,
        success: () => {
          return authApi
            .markBackupFileDelete({ id, __v })
            .then(() => {
              ElMessage.success('标记成功')
              getBackupList()
            })
            .catch(err => {
              console.error(err)
            })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
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
      // 将字节转换成MB
      formatSize,
      // 上传备份
      uploadDialog,
      openUploadDialog,
      uploadBackup,
      continueUploadId,
      continueUploadBackup,
      backupFileUploading,
      uploadProgress,
      markBackupFileDelete
    }
  }
}
</script>
<style scoped>
.uploader-dialog-body {
  min-height: 100px;
}
</style>
<style>
.uploader-dialog-body .el-progress-bar__outer {
  height: 18px !important;
}
</style>
