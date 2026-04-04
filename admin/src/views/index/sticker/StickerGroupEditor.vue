<template>
  <div class="common-right-panel-form common-limit-width">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'StickerGroupList' }">
        贴纸管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{
        groupData.name || '贴纸组详情'
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 贴纸组信息 -->
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      class="mt20"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入贴纸组名称"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="taxis">
        <el-input-number v-model="form.taxis" :min="0"></el-input-number>
        <div class="el-form-item-tip">
          数字越小越靠前。贴纸弹窗从第二个分组开始，首次会按这里的排序展示；当读者有“常用”记录后，下次打开弹窗时，会把用过的贴纸组按最近使用顺序提前，没用过的贴纸组仍然按这里的排序展示。
        </div>
      </el-form-item>
      <el-form-item label="显示" prop="status">
        <el-switch
          v-model="form.statusBool"
          active-text="显示"
          inactive-text="隐藏"
        ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleUpdateGroup"
          >保存贴纸组</el-button
        >
        <el-button type="danger" @click="handleDeleteGroup"
          >删除贴纸组</el-button
        >
      </el-form-item>
    </el-form>

    <el-divider></el-divider>

    <!-- 贴纸列表 -->
    <div class="flex justify-between items-center mb20">
      <h3 class="m0">贴纸列表（{{ stickerList.length }}张）</h3>
      <div class="sticker-list-toolbar">
        <el-button
          :type="isStickerSorting ? 'success' : 'default'"
          :loading="isStickerSortSubmitting"
          :disabled="stickerList.length < 2"
          @click="handleStickerSortButtonClick"
        >
          <el-icon class="mr5">
            <CircleCheck v-if="isStickerSorting" />
            <Rank v-else />
          </el-icon>
          {{ isStickerSorting ? '完成' : '排序' }}
        </el-button>
        <el-button
          type="primary"
          @click="triggerFileInput"
          :disabled="isStickerSorting"
        >
          <i class="fas fa-upload mr5"></i>添加贴纸
        </el-button>
      </div>
      <input
        type="file"
        ref="fileInputRef"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <div v-if="stickerList.length > 0">
      <draggable
        v-model="stickerList"
        item-key="_id"
        handle=".sticker-item-drag-handle"
        :disabled="!isStickerSorting"
        class="sticker-list"
        ghost-class="sticker-item-ghost"
        chosen-class="sticker-item-chosen"
      >
        <template #item="{ element: item, index }">
          <div class="sticker-item" :class="{ 'is-sorting': isStickerSorting }">
            <button
              v-if="isStickerSorting"
              type="button"
              class="sticker-item-drag-handle"
              title="拖动排序"
            >
              <el-icon><Rank /></el-icon>
            </button>
            <div class="sticker-item-img-wrap">
              <img
                :src="item.image"
                :alt="item.description"
                class="sticker-item-img"
              />
            </div>
            <div class="sticker-item-info">
              <div class="sticker-item-desc" :title="item.description">
                {{ item.description }}
              </div>
              <div class="sticker-item-meta">
                <span class="ml5 f12 text-gray">
                  排序: {{ isStickerSorting ? index + 1 : item.taxis }}
                </span>
                <el-switch
                  :model-value="item.status === 1"
                  :loading="stickerStatusLoadingMap[item._id] === true"
                  :disabled="isStickerSorting"
                  size="small"
                  inline-prompt
                  active-text="显"
                  inactive-text="隐"
                  @change="value => handleStickerStatusChange(item, value)"
                ></el-switch>
              </div>
            </div>
            <div class="sticker-item-actions">
              <el-button
                size="small"
                :disabled="isStickerSorting"
                @click="showEditDialog(item)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                :disabled="isStickerSorting"
                @click="handleDeleteSticker(item)"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <el-empty description="暂无贴纸" v-else></el-empty>

    <!-- 上传弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传贴纸"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-alert
        type="info"
        :closable="false"
        class="mb15"
        description="新上传的贴纸默认是隐藏状态。上传完成后，请按需在列表中开启显示。"
      ></el-alert>
      <div class="upload-sticker-grid" v-if="pendingFiles.length > 0">
        <div
          class="upload-sticker-card"
          v-for="(item, index) in pendingFiles"
          :key="index"
        >
          <div class="upload-sticker-card-preview">
            <img :src="item.previewUrl" class="upload-sticker-card-img" />
            <el-button
              v-if="!item.uploading && !item.uploaded"
              class="upload-sticker-card-remove"
              size="small"
              type="danger"
              :icon="'Delete'"
              circle
              @click="removePendingFile(index)"
            ></el-button>
            <div v-if="item.uploaded" class="upload-sticker-card-success">
              <el-icon color="#67c23a" size="24"><CircleCheck /></el-icon>
            </div>
          </div>
          <div class="upload-sticker-card-body">
            <el-input
              v-model="item.description"
              placeholder="描述（必填）"
              size="small"
              :disabled="item.uploading || item.uploaded"
            ></el-input>
            <div class="mt5" v-if="item.uploading">
              <el-progress
                :percentage="item.progress"
                :status="item.error ? 'exception' : undefined"
              ></el-progress>
            </div>
            <div class="mt5" v-if="item.error">
              <el-tag type="danger" size="small">{{ item.error }}</el-tag>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="uploadDialogVisible = false" :disabled="isUploading">
          {{ allUploaded ? '关闭' : '取消' }}
        </el-button>
        <el-button
          type="primary"
          @click="startUpload"
          :disabled="isUploading || allUploaded"
          v-if="!allUploaded"
        >
          开始上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑贴纸弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑贴纸"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        type="info"
        :closable="false"
        class="mb15"
        description="将贴纸设置为不显示后，博客读者将无法选择此贴纸。但已经在评论中使用的贴纸仍然会正常显示。"
      ></el-alert>
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="预览">
          <div>
            <div class="edit-sticker-preview">
              <img
                :src="editPreviewUrl || editForm.currentImage"
                class="edit-sticker-img"
              />
            </div>
            <el-button
              size="small"
              @click="triggerEditFileInput"
              class="mt5"
              style="width: 100px"
            >
              更换图片
            </el-button>
            <input
              type="file"
              ref="editFileInputRef"
              accept="image/*"
              style="display: none"
              @change="handleEditFileSelect"
            />
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editForm.description"
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="taxis">
          <el-input-number v-model="editForm.taxis" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="显示">
          <el-switch
            v-model="editForm.statusBool"
            active-text="显示"
            inactive-text="隐藏"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateSticker">确定</el-button>
      </template>
    </el-dialog>

    <!-- 替换贴纸弹窗 -->
    <StickerReplaceDialog ref="stickerReplaceRef" @done="getDetail" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { CircleCheck, Rank } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import StickerReplaceDialog from '@/components/StickerReplaceDialog.vue'
import CheckDialogService from '@/services/CheckDialogService'
import { escapeHtml } from '@/utils/utils'
import draggable from 'vuedraggable'

export default {
  name: 'StickerGroupEditor',
  components: {
    StickerReplaceDialog,
    CircleCheck,
    Rank,
    draggable
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const groupId = route.params.id
    const formRef = ref(null)
    const groupData = ref({})
    const stickerList = ref([])
    const stickerStatusLoadingMap = reactive({})
    const isStickerSorting = ref(false)
    const isStickerSortSubmitting = ref(false)
    const originalStickerOrder = ref([])

    const form = reactive({
      name: '',
      taxis: 0,
      statusBool: false
    })
    const rules = {
      name: [{ required: true, message: '请输入贴纸组名称', trigger: 'blur' }]
    }

    // 上传相关
    const fileInputRef = ref(null)
    const uploadDialogVisible = ref(false)
    const pendingFiles = ref([])
    const isUploading = ref(false)
    const allUploaded = computed(() => {
      if (pendingFiles.value.length === 0) return false
      return pendingFiles.value.every(f => f.uploaded)
    })

    // 编辑贴纸相关
    const editDialogVisible = ref(false)
    const editFormRef = ref(null)
    const editFileInputRef = ref(null)
    const editPreviewUrl = ref('')
    const editNewFile = ref(null)
    const editForm = reactive({
      id: '',
      __v: 0,
      description: '',
      taxis: 0,
      statusBool: true,
      currentImage: ''
    })
    const editRules = {
      description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
    }

    // 替换弹窗
    const stickerReplaceRef = ref(null)

    const getDetail = async () => {
      const res = await authApi.getStickerGroupDetail({ id: groupId })
      const data = res.data.data
      groupData.value = data
      form.name = data.name
      form.taxis = data.taxis
      form.statusBool = data.status === 1
      stickerList.value = data.stickers || []
      originalStickerOrder.value = stickerList.value.map(item =>
        String(item._id)
      )
      isStickerSorting.value = false
    }

    const handleStickerSortButtonClick = async () => {
      if (!isStickerSorting.value) {
        originalStickerOrder.value = stickerList.value.map(item =>
          String(item._id)
        )
        isStickerSorting.value = true
        return
      }

      if (isStickerSortSubmitting.value) {
        return
      }

      const nextOrder = stickerList.value.map(item => String(item._id))
      if (
        JSON.stringify(nextOrder) === JSON.stringify(originalStickerOrder.value)
      ) {
        isStickerSorting.value = false
        return
      }

      isStickerSortSubmitting.value = true
      try {
        await authApi.sortStickerList({
          groupId,
          stickerIds: nextOrder
        })
        ElMessage.success('排序已更新')
        await getDetail()
      } finally {
        isStickerSortSubmitting.value = false
      }
    }

    const handleUpdateGroup = () => {
      formRef.value.validate(valid => {
        if (!valid) return
        authApi
          .updateStickerGroup({
            id: groupId,
            __v: groupData.value.__v,
            name: form.name,
            taxis: form.taxis,
            status: form.statusBool ? 1 : 0
          })
          .then(() => {
            ElMessage.success('保存成功')
            getDetail()
          })
      })
    }

    const handleDeleteGroup = () => {
      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除贴纸组：【${escapeHtml(groupData.value.name || '')}】</span>及其所有贴纸文件，是否继续?`,
        success: () => {
          return authApi.deleteStickerGroup({ id: groupId }).then(() => {
            ElMessage.success('删除成功')
            router.push({ name: 'StickerGroupList' })
          })
        }
      })
        .then(() => {})
        .catch(() => {})
    }

    // 上传
    const triggerFileInput = () => {
      fileInputRef.value.click()
    }

    const handleFileSelect = e => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return

      pendingFiles.value = files.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        description: '',
        uploading: false,
        uploaded: false,
        progress: 0,
        error: null
      }))
      uploadDialogVisible.value = true
      // 重置 file input
      fileInputRef.value.value = ''
    }

    const removePendingFile = index => {
      URL.revokeObjectURL(pendingFiles.value[index].previewUrl)
      pendingFiles.value.splice(index, 1)
      if (pendingFiles.value.length === 0) {
        uploadDialogVisible.value = false
      }
    }

    const startUpload = async () => {
      // 校验描述
      for (let i = 0; i < pendingFiles.value.length; i++) {
        if (!pendingFiles.value[i].description.trim()) {
          ElMessage.error(`第 ${i + 1} 张贴纸的描述不能为空`)
          return
        }
      }

      isUploading.value = true

      for (let i = 0; i < pendingFiles.value.length; i++) {
        const item = pendingFiles.value[i]
        if (item.uploaded) continue

        item.uploading = true
        item.progress = 0

        const formData = new FormData()
        formData.append('file', item.file)
        formData.append('group', groupId)
        formData.append('description', item.description.trim())

        try {
          await authApi.uploadSticker(formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
              if (!progressEvent.total) {
                return
              }
              item.progress = Math.min(
                99,
                Math.round((progressEvent.loaded / progressEvent.total) * 100)
              )
            }
          })
          item.progress = 100
          item.uploaded = true
          item.uploading = false
          item.error = null
        } catch (err) {
          item.error = err.response?.data?.errors?.[0]?.message || '上传失败'
          item.uploading = false
        }
      }

      isUploading.value = false
      if (allUploaded.value) {
        getDetail()
      }
    }

    // 编辑贴纸
    const showEditDialog = item => {
      editForm.id = item._id
      editForm.__v = item.__v
      editForm.description = item.description
      editForm.taxis = item.taxis
      editForm.statusBool = item.status === 1
      editForm.currentImage = item.image
      editPreviewUrl.value = ''
      editNewFile.value = null
      editDialogVisible.value = true
    }

    const triggerEditFileInput = () => {
      editFileInputRef.value.click()
    }

    const handleEditFileSelect = e => {
      const file = e.target.files[0]
      if (!file) return
      editNewFile.value = file
      editPreviewUrl.value = URL.createObjectURL(file)
      editFileInputRef.value.value = ''
    }

    const handleUpdateSticker = () => {
      editFormRef.value.validate(async valid => {
        if (!valid) return

        const formData = new FormData()
        formData.append('id', editForm.id)
        formData.append('__v', editForm.__v)
        formData.append('description', editForm.description.trim())
        formData.append('status', editForm.statusBool ? 1 : 0)
        formData.append('taxis', editForm.taxis)

        if (editNewFile.value) {
          formData.append('file', editNewFile.value)
        }

        try {
          await authApi.updateSticker(formData)
          ElMessage.success('更新成功')
          editDialogVisible.value = false
          getDetail()
        } catch (err) {
          // Error handled by interceptor
        }
      })
    }

    const handleStickerStatusChange = (item, value) => {
      const id = item._id
      if (stickerStatusLoadingMap[id]) {
        return
      }
      stickerStatusLoadingMap[id] = true
      const formData = new FormData()
      formData.append('id', item._id)
      formData.append('__v', item.__v)
      formData.append('description', item.description)
      formData.append('status', value ? 1 : 0)
      formData.append('taxis', item.taxis)
      authApi
        .updateSticker(formData)
        .then(() => {
          item.status = value ? 1 : 0
          item.__v += 1
          ElMessage.success(`贴纸已${value ? '显示' : '隐藏'}`)
        })
        .catch(() => {})
        .finally(() => {
          stickerStatusLoadingMap[id] = false
        })
    }

    // 删除贴纸
    const handleDeleteSticker = item => {
      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除贴纸：【${escapeHtml(item.description || '')}】</span>，是否继续?`,
        success: async () => {
          try {
            await authApi.deleteSticker({ id: item._id })
            ElMessage.success('删除成功')
            getDetail()
          } catch (err) {
            const errorData = err.response?.data?.errors?.[0]
            if (errorData && errorData.code === 'STICKER_IN_USE') {
              ElMessageBox.confirm(
                `该贴纸被 ${errorData.referencedCount} 条评论引用，无法直接删除。是否先将其隐藏并进入全局替换流程？`,
                '贴纸被引用',
                {
                  confirmButtonText: '进入替换流程',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              ).then(async () => {
                await authApi.hideSticker({ id: item._id })
                getDetail()
                stickerReplaceRef.value.open(item)
              })
            }
          }
        }
      })
        .then(() => {})
        .catch(() => {})
    }

    onMounted(() => {
      getDetail()
    })

    return {
      groupId,
      groupData,
      form,
      rules,
      formRef,
      stickerList,
      handleUpdateGroup,
      handleDeleteGroup,
      getDetail,
      // upload
      fileInputRef,
      uploadDialogVisible,
      pendingFiles,
      isUploading,
      allUploaded,
      triggerFileInput,
      handleFileSelect,
      removePendingFile,
      startUpload,
      // edit
      editDialogVisible,
      editFormRef,
      editFileInputRef,
      editPreviewUrl,
      editForm,
      editRules,
      showEditDialog,
      triggerEditFileInput,
      handleEditFileSelect,
      handleUpdateSticker,
      stickerStatusLoadingMap,
      handleStickerStatusChange,
      // delete & replace
      handleDeleteSticker,
      stickerReplaceRef,
      isStickerSorting,
      isStickerSortSubmitting,
      handleStickerSortButtonClick
    }
  }
}
</script>

<style scoped>
.sticker-list-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sticker-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.sticker-item {
  position: relative;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 10px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sticker-item.is-sorting {
  padding-top: 44px;
}

.sticker-item-drag-handle {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  cursor: grab;
}

.sticker-item-drag-handle:active {
  cursor: grabbing;
}

.sticker-item-ghost {
  opacity: 0.6;
}

.sticker-item-chosen {
  border-color: var(--el-color-primary);
}
.sticker-item-img-wrap {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.sticker-item-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.sticker-item-info {
  width: 100%;
  text-align: center;
  margin-bottom: 8px;
}
.sticker-item-desc {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}
.sticker-item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.sticker-item-actions {
  display: flex;
  width: 100%;
  justify-content: center;
}
.el-form-item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-top: 4px;
}
.upload-sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  max-height: 480px;
  overflow-y: auto;
  padding: 4px;
}
.upload-sticker-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}
.upload-sticker-card-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
}
.upload-sticker-card-img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}
.upload-sticker-card-remove {
  position: absolute;
  top: 4px;
  right: 4px;
}
.upload-sticker-card-success {
  position: absolute;
  top: 4px;
  right: 4px;
}
.upload-sticker-card-body {
  padding: 8px;
}
.edit-sticker-preview {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
.edit-sticker-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.text-gray {
  color: var(--el-text-color-secondary);
}
.justify-between {
  display: flex;
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.m0 {
  margin: 0;
}
</style>
