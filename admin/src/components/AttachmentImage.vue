<template>
  <div class="attachment-image-body">
    <div class="attachment-image-content">
      <el-image
        :src="`${item.thumfor || item.filepath}?s=${$formatTimestamp(
          item.updatedAt
        )}`"
        fit="cover"
        loading="lazy"
        @click="openPreviewer(item)"
        style="width: 100%; height: 100%"
        class="zoom-in"
      />
    </div>
    <!-- 如果is360Panorama -->
    <div
      class="attachment-360-icon zoom-in"
      v-if="item.is360Panorama"
      @click="openPreviewer(item)"
    >
      360°
    </div>
    <!-- 如果是视频 isVideo 中间显示播放图标 -->
    <div
      class="attachment-play-icon zoom-in"
      v-if="isVideo"
      @click="openPreviewer(item)"
    >
      <el-icon><VideoPlay /></el-icon>
    </div>
    <div
      class="attachment-filename pointer"
      @click="toEditName"
      :title="item.name || '未命名'"
    >
      <span
        >{{ item.is360Panorama ? '【360°全景】' : ''
        }}{{ item.name || '未命名' }}</span
      >
      <div class="attachment-filename-edit-icon">
        <el-icon><Tools /></el-icon>
      </div>
    </div>
    <div
      class="attachment-selector-body pointer"
      :class="{
        'is-selected': isSelected
      }"
      @click="onSelectorClick"
    >
      <i class="far fa-circle" v-show="!isSelected"></i>
      <i class="fas fa-check-circle" v-show="isSelected"></i>
      <span
        class="attachment-selector-count"
        v-if="selectIndex !== null && isSelected"
        >{{ selectCount }}</span
      >
    </div>
  </div>
  <!-- 更改名称dialog -->
  <el-dialog
    title="更改信息"
    v-model="showNameDialog"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
  >
    <div>
      <el-form
        :model="formName"
        :rules="rulesName"
        ref="formNameRef"
        label-width="80px"
        @submit.prevent
      >
        <!-- 只有视频可以修改封面图 -->
        <el-form-item label="封面图" v-if="isVideo" prop="videoCover">
          <div class="w_10 max-width-cropper">
            <Cropper
              :aspectRatio="item.thumWidth / item.thumHeight"
              :width="item.thumWidth"
              :height="item.thumHeight"
              :src="formName.videoCover"
              @crop="setVideoCover"
            ></Cropper>
          </div>
        </el-form-item>
        <el-form-item label="媒体名称" prop="name">
          <el-input
            v-model="formName.name"
            placeholder="请输入媒体名称"
          ></el-input>
        </el-form-item>
        <!-- is360Panorama -->
        <el-form-item label="360°全景" prop="is360Panorama" v-if="isImage">
          <el-switch v-model="formName.is360Panorama"></el-switch>
        </el-form-item>
        <!-- description -->
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="formName.description"
            rows="5"
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
        <!-- 尺寸展示 -->
        <el-form-item label="媒体尺寸">
          <div class="attachment-image-size">
            <!-- width x height -->
            <span>{{ item.width }}px × {{ item.height }}px</span>
          </div>
        </el-form-item>
        <!-- 文件大小 -->
        <el-form-item label="文件大小">
          <div class="attachment-image-size">
            <!-- size -->
            <span>{{ formatSize(item.filesize) }}</span>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showNameDialog = false">取消</el-button>
        <el-button type="primary" @click="submitName"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { computed, reactive, ref, watch } from 'vue'
import { authApi } from '@/api'
import { loadAndOpenImg } from '@/utils/utils'
import store from '@/store'
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    selectIndex: {
      type: Number,
      default: null
    }
  },
  emits: ['onSelectorClick', 'onUpdateName'],
  setup(props, { emit }) {
    const onSelectorClick = () => {
      emit('onSelectorClick', props.item)
    }

    const showNameDialog = ref(false)
    const formNameRef = ref(null)
    const formName = reactive({
      videoCover: '',
      name: '',
      is360Panorama: false,
      description: ''
    })
    const rulesName = reactive({
      name: [{ required: true, message: '请输入媒体名称', trigger: 'blur' }]
    })
    const submitName = () => {
      formNameRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const params = {
          id: props.item._id,
          name: formName.name,
          videoCover: formName.videoCover,
          description: formName.description,
          is360Panorama: formName.is360Panorama,
          __v: props.item.__v
        }
        authApi.updateAttachmentInfo(params).then(() => {
          showNameDialog.value = false
          emit('onUpdateName', formName.name)
        })
      })
    }
    const toEditName = () => {
      formName.name = props.item.name || ''
      formName.videoCover = props.item.thumfor || ''
      formName.description = props.item.description || ''
      formName.is360Panorama = props.item.is360Panorama ? true : false
      showNameDialog.value = true
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const openPreviewer = item => {
      const mimetype = item.mimetype
      const { filepath, width, height, is360Panorama } = item
      loadAndOpenImg(0, [
        {
          src: `${filepath}`,
          width,
          height,
          mimetype,
          is360Panorama
        }
      ])
    }
    const isVideo = computed(() => {
      return props.item.mimetype.includes('video')
    })
    const isImage = computed(() => {
      return props.item.mimetype.includes('image')
    })

    const setVideoCover = data => {
      formName.videoCover = data
    }

    const selectCount = computed(() => {
      return props.selectIndex + 1
    })

    const formatSize = bytes => {
      if (!bytes || isNaN(bytes)) return '0 KB'

      if (bytes < 1024) {
        return bytes + ' B'
      } else if (bytes < 1048576) {
        // 1MB = 1024 * 1024
        return (bytes / 1024).toFixed(3) + ' KB'
      } else if (bytes < 1073741824) {
        // 1GB = 1024 * 1024 * 1024
        return (bytes / 1048576).toFixed(3) + ' MB'
      } else {
        return (bytes / 1073741824).toFixed(3) + ' GB'
      }
    }

    return {
      onSelectorClick,
      showNameDialog,
      formNameRef,
      formName,
      rulesName,
      submitName,
      toEditName,
      openPreviewer,
      isVideo,
      isImage,
      setVideoCover,
      selectCount,
      formatSize
    }
  }
}
</script>
<style scoped>
.attachment-image-body {
  /* padding 正方形 */
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.attachment-image-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
.attachment-filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 5px;
  padding-right: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
  color: #fff;
  z-index: 2;
}
.attachment-filename-edit-icon {
  position: absolute;
  z-index: 2;
  right: 5px;
  bottom: 3px;
}
.attachment-selector-body {
  /* 左上角 */
  position: absolute;
  top: 3px;
  left: 3px;
  padding: 2px;
  z-index: 2;
  font-size: 18px;
  line-height: 18px;
  color: #fff;
  text-shadow: 0 0 5px #000;
  display: flex;
  align-items: center;
}
.attachment-selector-body.is-selected {
  background-color: #67c23a;
  border-radius: 20px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
}
.attachment-selector-body .fa-check-circle {
  /* 绿色 */
  color: #ffffff;
  text-shadow: none;
}
.attachment-selector-count {
  font-size: 12px;
  color: #ffffff;
  font-weight: bold;
  padding: 0 5px;
  display: inline-block;
  text-shadow: none;
}
</style>
