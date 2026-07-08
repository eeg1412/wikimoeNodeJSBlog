<template>
  <el-form
    :model="mediaForm"
    :rules="mediaRules"
    ref="mediaFormRef"
    label-width="200px"
    v-if="inited"
  >
    <el-form-item label="开启图片压缩" prop="imgSettingEnableImgCompress">
      <el-switch v-model="mediaForm.imgSettingEnableImgCompress"></el-switch>
    </el-form-item>
    <div class="config-border-item">
      <div class="config-border-item-title mb5">
        图片压缩设置<span class="config-border-item-tip"
          >※当开启图片压缩时生效</span
        >
      </div>

      <el-form-item
        label="压缩为webp格式"
        prop="imgSettingEnableImgCompressWebp"
      >
        <el-switch
          v-model="mediaForm.imgSettingEnableImgCompressWebp"
        ></el-switch>
      </el-form-item>
      <el-form-item label="图片压缩质量" prop="imgSettingCompressQuality">
        <!-- 数字 1-100 -->
        <el-input-number
          v-model="mediaForm.imgSettingCompressQuality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="图片压缩最长边" prop="imgSettingCompressMaxSize">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.imgSettingCompressMaxSize"
          controls-position="right"
          :min="1"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
    </div>
    <el-form-item label="保留HDR" prop="imgSettingKeepHDR">
      <el-switch v-model="mediaForm.imgSettingKeepHDR"></el-switch>
    </el-form-item>
    <div class="config-border-item">
      <div class="config-border-item-title mb5">
        HDR设置<span class="config-border-item-tip"
          >※需开启「保留HDR」与「开启图片压缩」，且上传的是含gainmap的JPG图片时生效，将主图转换为HDR
          AVIF。当前仅支持将JPG gainmap转换为AVIF
          gainmap，其他格式会被忽略</span
        >
      </div>
      <el-form-item label="主图HDR质量" prop="imgSettingHDRQuality">
        <!-- 数字 1-100 -->
        <el-input-number
          v-model="mediaForm.imgSettingHDRQuality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item
        label="主图HDR GainMap质量"
        prop="imgSettingHDRGainMapQuality"
      >
        <!-- 数字 1-100 -->
        <el-input-number
          v-model="mediaForm.imgSettingHDRGainMapQuality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="缩略图HDR质量" prop="imgSettingThumbnailHDRQuality">
        <!-- 数字 1-100 -->
        <el-input-number
          v-model="mediaForm.imgSettingThumbnailHDRQuality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item
        label="缩略图HDR GainMap质量"
        prop="imgSettingThumbnailHDRGainMapQuality"
      >
        <!-- 数字 1-100 -->
        <el-input-number
          v-model="mediaForm.imgSettingThumbnailHDRGainMapQuality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="缩略图保留HDR" prop="imgSettingThumbnailKeepHDR">
        <div class="w_10">
          <el-switch v-model="mediaForm.imgSettingThumbnailKeepHDR"></el-switch>
          <div class="config-border-item-tip mt5">
            仅当「保留HDR」开启时生效。开启后缩略图也保留为HDR
            AVIF；关闭时对HDR图片生成普通SDR缩略图（含gainmap的HDR图片会强制生成一张SDR缩略图，除非在上传时选择不生成缩略图）。
          </div>
        </div>
      </el-form-item>
      <el-form-item label="HDR AVIF 编码速度" prop="imgSettingHDRAvifSpeed">
        <div class="w_10">
          <el-input-number
            v-model="mediaForm.imgSettingHDRAvifSpeed"
            controls-position="right"
            :min="0"
            :max="10"
            :step="1"
            :precision="0"
          ></el-input-number>
          <div class="config-border-item-tip mt5">
            取值 0-10，数值越小编码越慢、质量越好，越大越快、质量越低。默认
            6。主图与缩略图HDR AVIF转换均使用该速度。
          </div>
        </div>
      </el-form-item>
    </div>
    <el-form-item label="开启图片缩略图" prop="imgSettingEnableImgThumbnail">
      <el-switch v-model="mediaForm.imgSettingEnableImgThumbnail"></el-switch>
    </el-form-item>
    <div class="config-border-item">
      <div class="config-border-item-title mb5">
        缩略图设置<span class="config-border-item-tip"
          >※当开启缩略图时生效</span
        >
      </div>
      <el-form-item label="图片缩略图质量" prop="imgSettingThumbnailQuality">
        <!-- 数字 1-100 -->
        <el-input-number
          v-model="mediaForm.imgSettingThumbnailQuality"
          controls-position="right"
          :min="1"
          :max="100"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="图片缩略图最长边" prop="imgSettingThumbnailMaxSize">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.imgSettingThumbnailMaxSize"
          controls-position="right"
          :min="1"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <!-- 当前FFmpeg状态 已安装 未安装 -->
      <el-form-item label="FFmpeg状态">
        <div class="w_10">
          <el-tag
            v-if="ffmpegInstalled"
            type="success"
            effect="dark"
            size="small"
            >已安装</el-tag
          >
          <el-tag v-else type="danger" effect="dark" size="small"
            >未安装</el-tag
          >
        </div>
        <div class="w_10">
          <!-- installBaseUrl -->
          <el-input
            v-if="!ffmpegInstalled"
            v-model="installBaseUrl"
            placeholder="请输入安装地址域名"
            clearable
          >
            <template #append>
              <el-button
                type="primary"
                :loading="installLoading"
                @click="tryInstallFFmpeg"
                >安装</el-button
              >
            </template>
          </el-input>
          <el-button v-else type="danger" @click="tryUninstallFFmpeg"
            >卸载</el-button
          >
        </div>
      </el-form-item>
      <div class="config-border-item-title mb5">
        视频压缩设置<span class="config-border-item-tip"
          >※安装FFmpeg后生效</span
        >
      </div>
      <!-- 视频最长边 -->
      <el-form-item label="视频最长边">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.videoSettingCompressMaxSize"
          controls-position="right"
          :min="1"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <!-- 视频压缩码率 -->
      <el-form-item label="视频压缩码率">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.videoSettingCompressBitrate"
          controls-position="right"
          :min="1"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
      <!-- 视频压缩帧率 -->
      <el-form-item label="视频压缩帧率">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.videoSettingCompressFps"
          controls-position="right"
          :min="1"
          :step="1"
          :precision="0"
        ></el-input-number>
      </el-form-item>
    </div>
    <el-form-item>
      <el-button type="primary" @click="mediaSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import {
  formatResToForm,
  formatResToObj,
  installFFmpeg,
  uninstallFFmpeg,
  getFFmpegInstalled,
  fieldErrorNotice
} from '@/utils/utils'
import { ref, reactive, onMounted } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup(props, { emit }) {
    const mediaFormRef = ref(null)
    // // 开启图片压缩
    // imgSettingEnableImgCompress: false,
    // // 图片压缩为webp格式
    // imgSettingEnableImgCompressWebp: false,
    // // 图片压缩质量
    // imgSettingCompressQuality: 80,
    // // 图片压缩最长边
    // imgSettingCompressMaxSize: 1920,
    // // 开启图片缩略图
    // imgSettingEnableImgThumbnail: false,
    // // 图片缩略图质量
    // imgSettingThumbnailQuality: 40,
    // // 图片缩略图最长边
    // imgSettingThumbnailMaxSize: 680,
    const mediaForm = reactive({
      imgSettingEnableImgCompress: false,
      imgSettingEnableImgCompressWebp: false,
      imgSettingCompressQuality: 80,
      imgSettingCompressMaxSize: 1920,
      imgSettingEnableImgThumbnail: false,
      imgSettingThumbnailQuality: 40,
      imgSettingThumbnailMaxSize: 680,
      // 保留HDR
      imgSettingKeepHDR: false,
      // 缩略图保留HDR
      imgSettingThumbnailKeepHDR: false,
      // 主图HDR图片质量
      imgSettingHDRQuality: 80,
      // 主图HDR GainMap质量
      imgSettingHDRGainMapQuality: 70,
      // 缩略图HDR图片质量
      imgSettingThumbnailHDRQuality: 40,
      // 缩略图HDR GainMap质量
      imgSettingThumbnailHDRGainMapQuality: 70,
      // HDR AVIF 编码速度
      imgSettingHDRAvifSpeed: 6,
      // 视频最长边
      videoSettingCompressMaxSize: 480,
      // 视频压缩码率
      videoSettingCompressBitrate: 500,
      // 视频压缩帧率
      videoSettingCompressFps: 30
    })
    const mediaRules = {
      imgSettingCompressQuality: [
        { required: true, message: '请输入图片压缩质量', trigger: 'blur' }
      ],
      imgSettingCompressMaxSize: [
        { required: true, message: '请输入图片压缩最长边', trigger: 'blur' }
      ],
      imgSettingHDRQuality: [
        { required: true, message: '请输入主图HDR质量', trigger: 'blur' }
      ],
      imgSettingHDRGainMapQuality: [
        {
          required: true,
          message: '请输入主图HDR GainMap质量',
          trigger: 'blur'
        }
      ],
      imgSettingThumbnailHDRQuality: [
        { required: true, message: '请输入缩略图HDR质量', trigger: 'blur' }
      ],
      imgSettingThumbnailHDRGainMapQuality: [
        {
          required: true,
          message: '请输入缩略图HDR GainMap质量',
          trigger: 'blur'
        }
      ],
      imgSettingHDRAvifSpeed: [
        { required: true, message: '请输入HDR AVIF 编码速度', trigger: 'blur' }
      ],
      imgSettingThumbnailQuality: [
        {
          required: true,
          message: '请输入图片缩略图质量',
          trigger: 'blur'
        }
      ],
      imgSettingThumbnailMaxSize: [
        {
          required: true,
          message: '请输入图片缩略图最长边',
          trigger: 'blur'
        }
      ]
    }

    const mediaSubmit = () => {
      mediaFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(mediaForm).forEach(key => {
            params.push({
              name: key,
              value: mediaForm[key]
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(mediaForm, obj)
              store.dispatch('setOptions')
              emit('submitSuccess')

              ElMessage.success('更新成功')
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          // 弹窗
          fieldErrorNotice(fields)
          return false
        }
      })
    }
    const inited = ref(false)
    const getOptionList = () => {
      // 将mediaForm的key转换为数组
      const params = {
        nameList: []
      }
      Object.keys(mediaForm).forEach(key => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then(res => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(mediaForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    // 视频相关
    const ffmpegInstalled = ref(false)
    const installLoading = ref(false)
    const installBaseUrl = ref('https://unpkg.com')
    const tryInstallFFmpeg = () => {
      if (!installBaseUrl.value) {
        ElMessage.error('请输入安装地址域名')
        return
      }
      installLoading.value = true
      installFFmpeg(installBaseUrl.value)
        .then(res => {
          installLoading.value = false
          getFFmpegInstalled().then(res => {
            ffmpegInstalled.value = res
          })
          ElMessage.success('安装成功')
        })
        .catch(err => {
          installLoading.value = false
          ElMessage.error('安装失败')
        })
    }
    const tryUninstallFFmpeg = () => {
      ElMessageBox.confirm('确定要卸载吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          uninstallFFmpeg()
            .then(res => {
              getFFmpegInstalled().then(res => {
                ffmpegInstalled.value = res
              })
              ElMessage.success('卸载成功')
            })
            .catch(() => {
              ElMessage.error('卸载失败')
            })
        })
        .catch(() => {})
    }

    onMounted(() => {
      getOptionList()
      getFFmpegInstalled().then(res => {
        ffmpegInstalled.value = res
      })
    })
    return {
      mediaFormRef,
      mediaForm,
      mediaRules,
      mediaSubmit,
      inited,
      ffmpegInstalled,
      installLoading,
      installBaseUrl,
      tryInstallFFmpeg,
      tryUninstallFFmpeg
    }
  }
}
</script>
