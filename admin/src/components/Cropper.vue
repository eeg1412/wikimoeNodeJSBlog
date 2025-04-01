<template>
  <div>
    <el-upload
      class="avatar-uploader"
      :show-file-list="false"
      :auto-upload="false"
      :on-change="uploadImage"
      accept="image/*"
    >
      <img v-if="src" :src="src" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <div @paste="handlePaste" class="avatar-uploader-click-tips">
      单击这里粘贴图片
    </div>
  </div>

  <el-dialog
    v-model="cropperDialogOpen"
    :destroy-on-close="true"
    title="裁切"
    width="80%"
    :lock-scroll="false"
    :align-center="true"
  >
    <div class="cropper-body">
      <vue-cropper
        ref="cropper"
        class="com-cropper"
        :initialAspectRatio="initialAspectRatio"
        :aspect-ratio="aspectRatio"
        :src="imgSrc"
        :viewMode="2"
        :autoCropArea="1"
        dragMode="move"
        preview=".preview"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cropperDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="toCrop"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { ref } from 'vue'
import VueCropper from 'vue-cropperjs'
import { Plus } from '@element-plus/icons-vue'

export default {
  components: {
    VueCropper,
    Plus,
  },
  emits: ['crop'],
  props: {
    src: {
      type: String,
    },
    initialAspectRatio: {
      initialAspectRatio: Number,
      default: NaN,
    },
    aspectRatio: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    maxWidth: {
      type: Number,
      default: Infinity,
    },
    maxHeight: {
      type: Number,
      default: Infinity,
    },
    minWidth: {
      type: Number,
      default: 0,
    },
    minHeight: {
      type: Number,
      default: 0,
    },
    fixedMode: {
      type: Boolean,
      default: false,
    },
    putImageType: {
      type: String,
      default: 'image/webp',
    },
    putImageQuality: {
      type: Number,
      default: 0.8,
    },
  },
  setup(props, { emit }) {
    const cropperDialogOpen = ref(false)
    const cropper = ref(null)
    const imgSrc = ref('')
    const uploder = ref(null)
    const uploadImage = (file) => {
      // file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = (e) => {
        imgSrc.value = e.target.result
        cropperDialogOpen.value = true
      }
    }

    const handlePaste = (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items
      console.log(items)
      for (let index in items) {
        const item = items[index]
        if (item.kind === 'file') {
          const blob = item.getAsFile()
          if (blob.type.startsWith('image/')) {
            imgSrc.value = URL.createObjectURL(blob)
            cropperDialogOpen.value = true
          }
        }
      }
    }

    const toCrop = () => {
      let config = {
        maxWidth: props.maxWidth,
        maxHeight: props.maxHeight,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      }
      const base64 = cropper.value
        .getCroppedCanvas(config)
        .toDataURL('image/png')
      // 将base64图片缩放成设定的宽高
      const img = new Image()
      img.src = base64
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = props.width || img.width
        canvas.height = props.height || img.height
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64Resize = canvas.toDataURL(
          props.putImageType,
          props.putImageQuality
        )
        emit('crop', base64Resize)
        cropperDialogOpen.value = false
      }
      // console.log(base64)
      // emit('crop', base64)
      // cropperDialogOpen.value = false
    }
    return {
      handlePaste,
      cropper,
      cropperDialogOpen,
      imgSrc,
      uploadImage,
      toCrop,
      uploder,
    }
  },
}
</script>
<style lang="less">
.cropper-body {
  height: calc(100vh - 300px);
  min-height: 300px;
  overflow: hidden;
}
.com-cropper {
  width: 100%;
  height: 100%;
}
.avatar-uploader-click-tips {
  font-size: 12px;
  text-align: center;
  border: 1px dashed var(--el-border-color);
  cursor: pointer;
  line-height: 16px;
  padding: 10px 0;
}
</style>
