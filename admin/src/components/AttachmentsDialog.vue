<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
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
    <div>
      <el-upload
        class="upload-demo"
        drag
        action="/api/admin/attachment/upload"
        multiple
        :accept="'image/*'"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖动文件或点击上传</div>
      </el-upload>
      <div>
        <div
          class="dib"
          v-for="(item, index) in attachmentList"
          :key="item._id"
        >
          <el-image
            :src="item.thumfor || item.filepath"
            fit="cover"
            loading="lazy"
            :preview-src-list="[item.filepath]"
            style="width: 100px; height: 100px"
          />
        </div>
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
      }, 1000)
    }

    const handleError = (err) => {
      ElMessage.error(err.message)
      emit('error')
    }

    const attachmentList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
      album: albumId.value,
    })
    const total = ref(0)
    const getAttachmentList = (resetPage) => {
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
    }

    const changeAlbum = () => {
      params.album = albumId.value
      getAttachmentList(true)
      updateHeaders()
    }

    onMounted(() => {})
    onBeforeMount(() => {
      clearTimeout(getAttachmentListTimer)
    })
    return {
      visible,
      albumId,
      open,
      albumList,
      headers,
      updateHeaders,
      handleSuccess,
      handleError,
      changeAlbum,
      attachmentList,
    }
  },
}
</script>
<style scoped></style>
