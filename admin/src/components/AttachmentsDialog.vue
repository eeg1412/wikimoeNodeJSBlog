<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
    class="attachments-dialog"
    @closed="clearSelectedImageList"
    append-to-body
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass">
          <el-select
            v-model="albumId"
            placeholder="请选择相册"
            clearable
            @change="changeAlbum"
            @clear="changeAlbum"
            class="attachments-form-item"
          >
            <el-option
              v-for="item in albumList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
          <!-- 关键词 -->
          <el-input
            v-model="params.keyword"
            placeholder="关键词搜索"
            @keyup.enter="getAttachmentList(true)"
            @clear="getAttachmentList(true)"
            clearable
            class="attachments-form-item ml5"
          >
            <template #append>
              <el-button :icon="Search" @click="getAttachmentList(true)" />
            </template>
          </el-input>
        </div>
        <button
          aria-label="Close this dialog"
          class="el-dialog__headerbtn"
          type="button"
          @click="close"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </template>
    <div class="attachments-dialog-body" v-loading="attachmentsLoading">
      <div
        v-show="selectedImageList.length > 0"
        class="attachments-tool-bar-body"
      >
        <div class="w_10 tc">
          <div>
            已选中<span class="fb">{{ selectedImageList.length }}</span
            >件媒体文件
          </div>
          <div class="mt10">
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="deleteAttachments"
              :title="`删除${selectedImageList.length}件媒体文件`"
            />
            <!-- 移动相册按钮 icon SetUp -->
            <el-button
              type="info"
              :icon="SetUp"
              circle
              @click="changeAttachmentsAlbum"
              :title="`移动${selectedImageList.length}件媒体文件`"
            />
            <!-- 确定按钮 Select -->
            <el-button
              type="primary"
              :icon="Select"
              circle
              :title="`确定选择`"
              @click="selectAttachmentsOk"
              v-if="shouldSelectOk"
            />
            <!-- 关闭按钮 -->
            <el-button
              :icon="Close"
              circle
              :title="`取消选择`"
              @click="clearSelectedImageList"
            />
          </div>
        </div>
      </div>
      <el-upload
        v-show="selectedImageList.length <= 0"
        class="attachments-upload"
        drag
        action="/api/admin/attachment/upload"
        multiple
        v-model:file-list="fileList"
        :accept="'image/*'"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
        :disabled="!albumId"
        :class="albumId ? '' : 'attachments-upload-disabled'"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text" v-show="albumId">拖动文件或点击上传</div>
        <div class="el-upload__text" v-show="!albumId">请选择相册后上传</div>
      </el-upload>
      <div class="custom-scroll scroll-not-hide attachments-list-body clearfix">
        <template v-if="attachmentList.length > 0">
          <div
            class="fl attachment-item"
            v-for="(item, index) in attachmentList"
            :key="item._id"
          >
            <AttachmentImage
              :item="item"
              @onSelectorClick="onSelectorClick"
              :isSelected="findImageInSelectedImageList(item._id) > -1"
              @onUpdateName="getAttachmentList"
            />
          </div>
        </template>
        <template v-else>
          <div class="dflex flexCenter attachments-list-empty-body">
            <el-empty description="暂无媒体文件，请选择其他相册" />
          </div>
        </template>
      </div>
      <!-- 分页 -->
      <div class="clearfix mt10">
        <el-pagination
          class="fr"
          background
          layout="total, prev, pager, next"
          :total="total"
          v-model:page-size="params.size"
          v-model:current-page="params.page"
        />
      </div>
    </div>
  </el-dialog>
  <!-- 转移相册弹窗 -->
  <el-dialog
    v-model="toAlbumDialogVisible"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
    title="转移相册"
  >
    <div class="dflex flexCenter">
      <div class="pl10 pr10">转移至：</div>
      <el-select v-model="toAlbumId" placeholder="请选择相册">
        <el-option
          v-for="item in albumList"
          :key="item._id"
          :label="item.name"
          :value="item._id"
          v-show="item._id !== albumId"
        />
      </el-select>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="toAlbumDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="toChangeAttachmentsAlbum"
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  computed,
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import store from '@/store'
// AttachmentImage
import AttachmentImage from '@/components/AttachmentImage.vue'
import { Delete, Close, SetUp, Select, Search } from '@element-plus/icons-vue'

export default {
  components: {
    AttachmentImage,
  },
  props: {
    albumIdProp: {
      type: String,
      default: '',
    },
    shouldSelectOk: {
      type: Boolean,
      default: false,
    },
    // 选择上限
    selectLimit: {
      type: Number,
      default: null,
    },
  },
  emits: [
    'success',
    'error',
    'paramsChange',
    'onAttachmentsDelete',
    'onAttachmentsAlbumChange',
    'selectAttachments',
  ],
  setup(props, { emit }) {
    const visible = ref(false)
    const fileList = ref([])
    const albumId = ref('')
    const open = async () => {
      attachmentList.value = []
      albumId.value = props.albumIdProp
      await getAlbumList()
      if (!albumId.value && albumList.value.length > 0) {
        albumId.value = albumList.value[0]._id || ''
      }
      params.album = albumId.value
      updateHeaders()
      getAttachmentList(true, true)
      nextTick(() => {
        visible.value = true
      })
    }

    const albumList = ref([])
    const getAlbumList = async () => {
      const params = {
        page: 1,
        size: 999999,
        keyword: '',
      }
      await authApi.getAlbumList(params).then((res) => {
        albumList.value = res.data.list
      })
    }

    const headers = ref({})
    const updateHeaders = () => {
      headers.value = {
        Authorization: `Bearer ${store.getters.adminToken}`,
        AlbumId: albumId.value,
      }
    }

    let getAttachmentListTimer = null

    const handleSuccess = (res) => {
      console.log(res)
      emit('success', res)
      clearTimeout(getAttachmentListTimer)
      getAttachmentListTimer = setTimeout(() => {
        getAttachmentList()
      }, 500)
    }

    const handleError = (err) => {
      try {
        const obj = JSON.parse(err.message)
        const errors = obj.errors
        errors.forEach((item) => {
          ElMessage.error(item.message)
        })
      } catch (error) {
        ElMessage.error(err.message)
      }
      emit('error')
    }

    const attachmentsLoading = ref(false)
    const attachmentList = ref([])
    const params = reactive({
      page: 1,
      size: 20,
      keyword: '',
      album: albumId.value,
    })
    const total = ref(0)
    const getAttachmentList = (resetPage, resetKeyword) => {
      attachmentsLoading.value = true
      if (resetPage) {
        params.page = 1
      }
      if (resetKeyword) {
        params.keyword = ''
      }
      authApi
        .getAttachmentList(params)
        .then((res) => {
          attachmentList.value = res.data.list
          total.value = res.data.total
          emit('paramsChange', params)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          attachmentsLoading.value = false
        })
    }

    const changeAlbum = () => {
      params.album = albumId.value
      clearSelectedImageList()
      getAttachmentList(true, true)
      updateHeaders()
    }

    // watch fileList
    watch(
      fileList,
      (newVal, oldVal) => {
        console.log(newVal, oldVal)
        clearSuccessFileList()
      },
      { deep: true }
    )

    let clearSuccessFileListTimer = null
    const clearSuccessFileList = () => {
      clearTimeout(clearSuccessFileListTimer)
      clearSuccessFileListTimer = setTimeout(() => {
        // 清除掉status: "success" 的file
        const filterList = fileList.value.filter((item) => {
          return item.status !== 'success'
        })
        if (filterList.length !== fileList.value.length) {
          fileList.value = filterList
        }
      }, 500)
    }

    const selectedImageList = computed(() => {
      return selectedImageObjList.value.map((item) => {
        return item._id
      })
    })
    const selectedImageObjList = ref([])
    const onSelectorClick = (item) => {
      // 找到id
      const id = item._id
      // 如果selectedImageList中有这个id，就删除，否则就添加
      const index = findImageInSelectedImageList(id)
      if (index > -1) {
        selectedImageObjList.value.splice(index, 1)
      } else {
        if (props.selectLimit) {
          if (selectedImageList.value.length >= props.selectLimit) {
            ElMessage.error(`最多只能选择${props.selectLimit}件媒体文件`)
            return
          }
        }
        selectedImageObjList.value.push(item)
      }
    }
    const findImageInSelectedImageList = (id) => {
      const index = selectedImageList.value.findIndex((item) => {
        return item === id
      })
      return index
    }

    const deleteAttachments = () => {
      // 弹窗确认
      ElMessageBox.confirm(
        `确定要删除${selectedImageList.value.length}件媒体文件吗？`,
        {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
        }
      )
        .then(() => {
          // 删除
          const promiseList = selectedImageList.value.map((item) => {
            return new Promise((resolve, reject) => {
              authApi
                .deleteAttachment({ id: item })
                .then(() => {
                  resolve(true)
                })
                .catch(() => {
                  resolve(false)
                })
            })
          })
          Promise.all(promiseList)
            .then((res) => {
              // 统计有多少个成功，多少个失败
              let successCount = 0
              let failCount = 0
              res.forEach((item) => {
                if (item) {
                  successCount++
                } else {
                  failCount++
                }
              })
              // 提示
              if (failCount > 0) {
                ElMessage(
                  `成功删除${successCount}件媒体文件，失败${failCount}件`
                )
              } else {
                ElMessage(`成功删除${successCount}件媒体文件`)
              }
              // 清空selectedImageList
              clearSelectedImageList()
              getAttachmentList()
              emit('onAttachmentsDelete')
            })
            .catch(() => {})
        })
        .catch(() => {})
    }

    const toAlbumDialogVisible = ref(false)
    const toAlbumId = ref('')
    const changeAttachmentsAlbum = () => {
      toAlbumId.value = ''
      toAlbumDialogVisible.value = true
    }
    const toChangeAttachmentsAlbum = () => {
      const params = {
        ids: selectedImageList.value,
        albumId: toAlbumId.value,
      }
      authApi
        .updateAttachmentAlbum(params)
        .then(() => {
          ElMessage.success('转移成功')
          toAlbumDialogVisible.value = false
          clearSelectedImageList()
          getAttachmentList()
          emit('onAttachmentsAlbumChange')
        })
        .catch(() => {})
    }
    // 清空selectedImageList
    const clearSelectedImageList = () => {
      selectedImageObjList.value = []
    }

    const selectAttachmentsOk = () => {
      emit('selectAttachments', selectedImageObjList.value)
      visible.value = false
    }

    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getAttachmentList()
      }
    )

    onMounted(() => {})
    onBeforeMount(() => {
      clearTimeout(getAttachmentListTimer)
    })
    return {
      Delete,
      Close,
      SetUp,
      Select,
      Search,
      visible,
      fileList,
      albumId,
      open,
      albumList,
      params,
      total,
      getAttachmentList,
      headers,
      updateHeaders,
      handleSuccess,
      handleError,
      changeAlbum,
      attachmentsLoading,
      attachmentList,
      selectedImageList,
      onSelectorClick,
      findImageInSelectedImageList,
      deleteAttachments,
      clearSelectedImageList,
      toAlbumDialogVisible,
      toAlbumId,
      changeAttachmentsAlbum,
      toChangeAttachmentsAlbum,
      clearSelectedImageList,
      selectAttachmentsOk,
    }
  },
}
</script>
<style scoped>
.attachment-item {
  width: 20%;
}
.attachments-list-body {
  height: calc(100vh - 430px);
  min-height: 200px;
  overflow: auto;
}
.attachments-list-empty-body {
  height: calc(100vh - 480px);
}
.attachments-upload {
  overflow: hidden;
}
.attachments-tool-bar-body {
  height: 97px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.attachments-form-item {
  width: 200px;
}
.attachments-upload-disabled {
  opacity: 0.3;
}
/* 小于500 */
@media screen and (max-width: 500px) {
  .attachment-item {
    width: 50%;
  }
  .attachments-form-item {
    width: 145px;
  }
}
/* 小于375 */
@media screen and (max-width: 375px) {
  .attachments-form-item {
    width: 120px;
  }
}
</style>

<style>
.attachments-dialog {
  width: 800px;
}
.attachments-dialog .el-upload-dragger {
  height: 97px;
  overflow: hidden;
}
.attachments-dialog .el-icon--upload {
  font-size: 30px;
  margin-bottom: 6px;
  line-height: 42px;
}
.attachments-dialog .el-dialog__body {
  padding-top: 0;
}
.attachments-dialog .el-upload-list {
  max-height: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 10px 0;
}
.attachments-dialog .el-upload-list__item.is-uploading {
  padding-bottom: 15px;
}
.attachments-dialog .el-upload-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.attachments-dialog .el-upload-list::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: #bbb;
}
.attachments-dialog .el-upload-list:hover::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: #bbb;
}

.attachments-dialog .el-upload-list::-webkit-scrollbar-thumb:hover {
  background-color: #bbb;
}
.attachments-dialog .el-upload-list.scroll-not-hide::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: #bbb;
}
</style>
