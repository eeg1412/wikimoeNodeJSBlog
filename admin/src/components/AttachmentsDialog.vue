<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
    class="attachments-dialog"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <div :id="titleId" :class="titleClass">
          <el-select
            v-model="albumId"
            placeholder="请选择相册"
            @change="changeAlbum"
          >
            <el-option
              v-for="item in albumList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
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
      <el-upload
        class="upload-demo"
        drag
        action="/api/admin/attachment/upload"
        multiple
        v-model:file-list="fileList"
        :accept="'image/*'"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖动文件或点击上传</div>
      </el-upload>
      <div
        class="mt15 custom-scroll scroll-not-hide attachments-list-body clearfix"
      >
        <template v-if="attachmentList.length > 0">
          <div
            class="fl attachment-item"
            v-for="(item, index) in attachmentList"
            :key="item._id"
          >
            <el-image
              :src="item.thumfor || item.filepath"
              fit="cover"
              loading="lazy"
              :preview-src-list="[item.filepath]"
              style="width: 100%; height: 100px"
            />
          </div>
        </template>
        <template v-else>
          <div class="full-height dflex flexCenter">
            <el-empty description="暂无媒体文件，请选择其他相册" />
          </div>
        </template>
      </div>
      <!-- 分页 -->
      <div class="clearfix mt10">
        <el-pagination
          class="fr"
          background
          layout="prev, pager, next"
          :total="total"
          v-model:page-size="params.size"
          v-model:current-page="params.page"
        />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
import store from '@/store'

export default {
  props: {
    albumIdProp: {
      type: String,
      default: '',
    },
  },
  emits: ['success', 'error', 'paramsChange'],
  setup(props, { emit }) {
    const visible = ref(false)
    const fileList = ref([])
    const albumId = ref('')
    const open = () => {
      attachmentList.value = []
      albumId.value = props.albumIdProp
      updateHeaders()
      getAlbumList()
      params.album = albumId.value
      getAttachmentList(true)
      nextTick(() => {
        visible.value = true
      })
    }

    const albumList = ref([])
    const getAlbumList = () => {
      const params = {
        page: 1,
        size: 999999,
        keyword: '',
      }
      authApi.getAlbumList(params).then((res) => {
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
      ElMessage.error(err.message)
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
    const getAttachmentList = (resetPage) => {
      attachmentsLoading.value = true
      if (resetPage) {
        params.page = 1
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
      getAttachmentList(true)
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
        fileList.value = fileList.value.filter((item) => {
          return item.status !== 'success'
        })
      }, 500)
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
      visible,
      fileList,
      albumId,
      open,
      albumList,
      params,
      total,
      headers,
      updateHeaders,
      handleSuccess,
      handleError,
      changeAlbum,
      attachmentsLoading,
      attachmentList,
    }
  },
}
</script>
<style scoped>
.attachment-item {
  width: 20%;
}
.attachments-list-body {
  height: calc(100vh - 550px);
  min-height: 200px;
  overflow: auto;
}
/* 小于500 */
@media screen and (max-width: 500px) {
  .attachment-item {
    width: 50%;
  }
}
</style>

<style>
.attachments-dialog {
  width: 800px;
}
.attachments-dialog .el-dialog__body {
  padding-top: 0;
}
.attachments-dialog .el-upload-list {
  max-height: 100px;
  overflow-y: auto;
  overflow-x: hidden;
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
