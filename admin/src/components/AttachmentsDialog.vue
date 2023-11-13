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
          <el-select v-model="albumId" placeholder="请选择相册">
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
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖动文件或点击上传</div>
      </el-upload>
    </div>
  </el-dialog>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import store from '@/store'

export default {
  props: {
    albumIdProp: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const visible = ref(false)
    const albumId = ref('')
    const open = () => {
      albumId.value = props.albumIdProp
      updateHeaders()
      visible.value = true
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

    onMounted(() => {
      getAlbumList()
    })
    return {
      visible,
      albumId,
      open,
      albumList,
      headers,
    }
  },
}
</script>
<style scoped></style>
