<template>
  <el-upload
    class="attachments-upload"
    drag
    :show-file-list="false"
    :auto-upload="false"
    :on-change="uploadVideo"
    :accept="
      options.noCompress
        ? '.mp4'
        : 'video/*,.mkv,.mov,.mp4,.m4v,.mk3d,.wmv,.asf,.mxf,.ts,.m2ts,.3gp,.3g2,.flv,.webm,.ogv,.rmvb,.avi'
    "
    :disabled="!albumId || !ffmpegInstalled"
    :class="albumId && ffmpegInstalled ? '' : 'attachments-upload-disabled'"
  >
    <el-icon class="el-icon--upload"><Film /></el-icon>
    <div class="el-upload__text" v-show="albumId && ffmpegInstalled">
      拖动文件或点击上传
    </div>
    <div class="el-upload__text" v-show="!albumId">请选择相册后上传</div>
    <!-- ffmpegInstalled -->
    <div class="el-upload__text" v-show="!ffmpegInstalled">
      请去设置中安装FFmpeg
    </div>
    <div class="mt5">
      <el-popover placement="bottom" :width="200" trigger="click">
        <div>
          <!-- 不压缩图片checkbox -->
          <el-checkbox
            @click.stop
            size="small"
            v-model="options.noCompress"
            label="直接上传"
          />
        </div>
        <template #reference>
          <el-button
            size="small"
            :type="options.noCompress ? 'primary' : ''"
            :plain="!options.noCompress"
            @click.stop
          >
            <el-icon><Setting /></el-icon><span class="pl3">设置</span>
          </el-button>
        </template>
      </el-popover>
    </div>
  </el-upload>
  <el-dialog
    v-model="editorVisible"
    title="视频编辑"
    destroy-on-close
    :show-close="!videoLoading"
    :close-on-click-modal="false"
    align-center
    append-to-body
    @closed="onClosed"
  >
    <div v-if="step === 1">
      <div class="mb5">
        <video
          class="video-upload-video"
          ref="videoRef"
          :src="videoUrl"
          playsinline
          controls
          muted
        ></video>
      </div>

      <div>
        <el-form
          :model="videoForm"
          :rules="videoRule"
          ref="mediaFormRef"
          label-width="100px"
        >
          <!-- 开始时间 -->
          <el-form-item label="开始时间" prop="startTime">
            <span class="pr5">{{ videoForm.startTime }}</span
            ><el-button size="small" @click="getStartTime"
              >获取开始时间</el-button
            >
          </el-form-item>
          <!-- 结束时间 -->
          <el-form-item label="结束时间" prop="endTime">
            <span class="pr5">{{ videoForm.endTime }}</span
            ><el-button size="small" @click="getEndTime"
              >获取结束时间</el-button
            >
          </el-form-item>
          <!-- 视频最压缩长边 -->
          <el-form-item label="最长边">
            <!-- 数字 1-4096 -->
            <el-input-number
              v-model="videoForm.videoSettingCompressMaxSize"
              controls-position="right"
              :min="2"
              :step="2"
              size="small"
            ></el-input-number>
          </el-form-item>
          <!-- 视频压缩码率 -->
          <el-form-item label="码率">
            <!-- 数字 1-4096 -->
            <el-input-number
              v-model="videoForm.videoSettingCompressBitrate"
              controls-position="right"
              :min="1"
              :step="1"
              size="small"
            ></el-input-number>
          </el-form-item>
          <!-- 视频压缩帧率 -->
          <el-form-item label="帧率">
            <!-- 数字 1-4096 -->
            <el-input-number
              v-model="videoForm.videoSettingCompressFps"
              controls-position="right"
              :min="1"
              :step="1"
              size="small"
            ></el-input-number>
          </el-form-item>
          <!-- 压缩 -->
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              :loading="videoLoading"
              @click="tryCompressVideo"
            >
              压缩
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="video-uploader-log-body" v-else-if="step === 2">
      <div class="pt5 pb5">压缩中...</div>
      <div class="video-uploader-log">{{ log }}</div>
    </div>
    <div v-else-if="step === 3">
      <div class="pt5 pb5">视频预览({{ outputVideoSizeToMb }}MB)：</div>
      <video
        class="video-upload-video"
        ref="outputVideoRef"
        :src="outputVideoUrl"
        playsinline
        controls
        muted
      ></video>
      <div class="pt5 pb5">视频封面：</div>
      <div>
        <img class="video-upload-video" :src="outputVideoCoverUrl" />
      </div>
      <!-- 上传按钮 -->
      <div class="mt5">
        <el-button
          type="primary"
          size="small"
          :loading="videoLoading"
          @click="tryUploadVideo"
        >
          上传
        </el-button>
        <!-- 下载 -->
        <el-button type="primary" size="small" @click="tryDownloadVideo">
          下载
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import store from '@/store'
import { getFFmpegInstalled, initFFmpeg, execFFmpeg } from '@/utils/utils'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
export default {
  props: {
    albumId: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const videoLoading = ref(false)
    const step = ref(1)
    const options = reactive({
      noCompress: false,
    })
    const headers = computed(() => {
      return {
        Authorization: `Bearer ${store.getters.adminToken}`,
        AlbumId: props.albumId,
        'x-no-compress': options.noCompress ? '1' : '0',
        'x-no-thumbnail': options.noThumbnail ? '1' : '0',
      }
    })

    const videoUrl = ref('')
    const videoRef = ref(null)
    let file = null
    let fileRawName = ''
    const uploadVideo = async (file_) => {
      file = file_.raw
      fileRawName = file_.name
      // 禁止大于500M的文件
      if (file.size > 500 * 1024 * 1024) {
        ElMessage.error('文件大小不能超过500M')
        return
      }
      videoUrl.value = URL.createObjectURL(file)
      editorVisible.value = true
      nextTick(() => {
        videoForm.startTime = 0
        // 将endTime设置为视频结束时间
        videoForm.endTime = videoRef.value.onloadedmetadata = () => {
          videoForm.endTime = videoRef.value.duration
        }
      })
    }
    const videoForm = reactive({
      // 开始时间
      startTime: 0,
      // 结束时间
      endTime: 1,
      // 视频压缩最长边
      videoSettingCompressMaxSize: 480,
      // 视频压缩码率
      videoSettingCompressBitrate: 500,
      // 视频压缩帧率
      videoSettingCompressFps: 30,
    })
    const getOptionList = () => {
      // 将mediaForm的key转换为数组
      const params = {
        nameList: [
          'videoSettingCompressMaxSize',
          'videoSettingCompressBitrate',
          'videoSettingCompressFps',
        ],
      }
      authApi.getOptionList(params).then((res) => {
        res.data.data.forEach((item) => {
          videoForm[item.name] = Number(item.value)
        })
      })
    }
    const videoRule = {
      startTime: [
        {
          required: true,
          message: '请输入开始时间',
          trigger: 'blur',
        },
      ],
      endTime: [
        {
          required: true,
          message: '请输入结束时间',
          trigger: 'blur',
        },
      ],
      videoSettingCompressMaxSize: [
        {
          required: true,
          message: '请输入视频压缩最长边',
          trigger: 'blur',
        },
      ],
      videoSettingCompressBitrate: [
        {
          required: true,
          message: '请输入视频压缩码率',
          trigger: 'blur',
        },
      ],
      videoSettingCompressFps: [
        {
          required: true,
          message: '请输入视频压缩帧率',
          trigger: 'blur',
        },
      ],
    }
    // 获取开始时间
    const getStartTime = () => {
      videoForm.startTime = videoRef.value.currentTime
    }
    // 获取结束时间
    const getEndTime = () => {
      videoForm.endTime = videoRef.value.currentTime
    }

    const ffmpegInstalled = ref(false)
    const editorVisible = ref(false)

    const log = ref('')
    const outputVideoRef = ref(null)
    const outputVideoUrl = ref('')
    const outputVideoSize = ref(0)
    const outputVideoSizeToMb = computed(() => {
      return (outputVideoSize.value / 1024 / 1024).toFixed(3)
    })
    const outputVideoCoverUrl = ref('')
    function formatTime(timeInSeconds) {
      const hours = Math.floor(timeInSeconds / 3600)
      const minutes = Math.floor((timeInSeconds - hours * 3600) / 60)
      const seconds = timeInSeconds - hours * 3600 - minutes * 60
      const milliseconds = parseInt((seconds - Math.floor(seconds)) * 1000)

      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${Math.floor(seconds)
        .toString()
        .padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
    }

    let ffmpeg = null
    const tryInitFFmpeg = async () => {
      ffmpeg = await initFFmpeg().catch((err) => {
        ElMessage.error('初始化FFmpeg失败')
        console.log(err)
      })
    }
    const tryGetVideoCover = () => {
      const promise = new Promise((resolve, reject) => {
        const video = outputVideoRef.value
        video.onloadeddata = () => {
          setTimeout(() => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const video = outputVideoRef.value
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            // 转成webp
            canvas.toBlob((blob) => {
              outputVideoCoverUrl.value = URL.createObjectURL(blob)
              resolve()
            }, 'image/webp')
          }, 1000)
        }
      })
      return promise
    }
    const tryCompressVideo = async () => {
      videoLoading.value = true
      // 初始化ffmpeg
      if (!ffmpeg) {
        await tryInitFFmpeg()
      }
      // log
      log.value = ''
      ffmpeg.on('log', (msg) => {
        log.value = msg.message
        console.log(msg.message)
      })
      // 开始压缩
      const arg = []
      // 获取视频宽高
      const videoWidth = videoRef.value.videoWidth
      const videoHeight = videoRef.value.videoHeight
      // 根据最长边 计算宽高
      const maxSize = videoForm.videoSettingCompressMaxSize
      let width =
        videoWidth > videoHeight
          ? maxSize
          : (maxSize * videoWidth) / videoHeight
      let height =
        videoWidth > videoHeight
          ? (maxSize * videoHeight) / videoWidth
          : maxSize
      // 大小取整
      width = Math.floor(width)
      height = Math.floor(height)
      // 确保宽度和高度是 2 的倍数
      width = width % 2 === 0 ? width : width - 1
      height = height % 2 === 0 ? height : height - 1
      // 开始时间
      const startTime = videoForm.startTime
      // 结束时间
      const endTime = videoForm.endTime
      // 压缩码率
      const bitrate = videoForm.videoSettingCompressBitrate
      // 压缩帧率
      const fps = videoForm.videoSettingCompressFps
      // 输出文件名
      const outputFileName = 'output.mp4'
      // 压缩视频
      arg.push('-i', 'input')
      arg.push('-ss', formatTime(startTime))
      arg.push('-t', formatTime(endTime - startTime))
      arg.push('-s', `${width}x${height}`)
      arg.push('-b:v', `${bitrate}k`)
      arg.push('-r', `${fps}`)
      arg.push('-c:v', 'libx264')
      arg.push('-c:a', 'aac')
      arg.push('-preset', 'veryfast')
      arg.push('-f', 'mp4')
      arg.push(outputFileName)
      step.value = 2
      // 执行
      const result = await execFFmpeg(ffmpeg, file, arg, outputFileName)
      // 输出视频
      outputVideoUrl.value = URL.createObjectURL(result)
      outputVideoSize.value = result.size
      step.value = 3
      nextTick(() => {
        tryGetVideoCover()
      })
      videoLoading.value = false
    }
    const onClosed = () => {
      videoUrl.value = ''
      videoForm.startTime = 0
      videoForm.endTime = 1
      outputVideoUrl.value = ''
      outputVideoCoverUrl.value = ''
      videoLoading.value = false
      fileRawName = ''
      step.value = 1
      outputVideoSize.value = 0
    }

    const tryUploadVideo = async () => {
      videoLoading.value = true
      const formData = new FormData()
      // 将 outputVideoUrl.value 上传
      const response = await fetch(outputVideoUrl.value)
      const blob = await response.blob()

      // 将 Blob 对象添加到 FormData 中
      formData.append('video', blob, fileRawName)
      // 将封面图片添加到FormData中
      const responseCover = await fetch(outputVideoCoverUrl.value)
      const blobCover = await responseCover.blob()
      formData.append('cover', blobCover, 'cover.webp')
      // 视频宽度
      formData.append('width', outputVideoRef.value.videoWidth)
      // 视频高度
      formData.append('height', outputVideoRef.value.videoHeight)
    }
    const tryDownloadVideo = () => {
      const a = document.createElement('a')
      a.href = outputVideoUrl.value
      a.download = fileRawName
      a.click()
    }
    onMounted(async () => {
      ffmpegInstalled.value = await getFFmpegInstalled()
      getOptionList()
    })
    return {
      videoLoading,
      step,
      options,
      videoUrl,
      videoRef,
      uploadVideo,
      videoForm,
      videoRule,
      getStartTime,
      getEndTime,
      ffmpegInstalled,
      editorVisible,
      tryCompressVideo,
      log,
      outputVideoRef,
      outputVideoUrl,
      outputVideoCoverUrl,
      outputVideoSize,
      outputVideoSizeToMb,
      onClosed,
      tryUploadVideo,
      tryDownloadVideo,
    }
  },
}
</script>
<style scoped>
.video-upload-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  margin: auto;
}
.video-uploader-log-body {
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保容器占满所有可用空间 */
}
.video-uploader-log {
  max-height: 50vh;
  max-height: 50dvh;
  overflow: auto;
  word-break: break-all;
  white-space: pre-wrap;
  margin-top: auto;
}
</style>
