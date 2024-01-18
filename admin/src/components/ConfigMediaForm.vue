<template>
  <el-form
    :model="mediaForm"
    :rules="mediaRules"
    ref="mediaFormRef"
    label-width="150px"
  >
    <el-form-item label="开启图片压缩" prop="imgSettingEnableImgCompress">
      <el-switch v-model="mediaForm.imgSettingEnableImgCompress"></el-switch>
    </el-form-item>
    <div class="config-border-item">
      <div class="config-border-item-title">
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
        ></el-input-number>
      </el-form-item>
      <el-form-item label="图片压缩最长边" prop="imgSettingCompressMaxSize">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.imgSettingCompressMaxSize"
          controls-position="right"
          :min="1"
          :step="1"
        ></el-input-number>
      </el-form-item>
    </div>
    <el-form-item label="开启图片缩略图" prop="imgSettingEnableImgThumbnail">
      <el-switch v-model="mediaForm.imgSettingEnableImgThumbnail"></el-switch>
    </el-form-item>
    <div class="config-border-item">
      <div class="config-border-item-title">
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
        ></el-input-number>
      </el-form-item>
      <el-form-item label="图片缩略图最长边" prop="imgSettingThumbnailMaxSize">
        <!-- 数字 1-4096 -->
        <el-input-number
          v-model="mediaForm.imgSettingThumbnailMaxSize"
          controls-position="right"
          :min="1"
          :step="1"
        ></el-input-number>
      </el-form-item>
    </div>
    <el-form-item>
      <el-button type="primary" @click="mediaSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { formatResToForm, formatResToObj } from '@/utils/utils'
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
    })
    const mediaRules = {
      imgSettingCompressQuality: [
        { required: true, message: '请输入图片压缩质量', trigger: 'blur' },
      ],
      imgSettingCompressMaxSize: [
        { required: true, message: '请输入图片压缩最长边', trigger: 'blur' },
      ],
      imgSettingThumbnailQuality: [
        {
          required: true,
          message: '请输入图片缩略图质量',
          trigger: 'blur',
        },
      ],
      imgSettingThumbnailMaxSize: [
        {
          required: true,
          message: '请输入图片缩略图最长边',
          trigger: 'blur',
        },
      ],
    }

    const mediaSubmit = () => {
      mediaFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(mediaForm).forEach((key) => {
            params.push({
              name: key,
              value: mediaForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(mediaForm, obj)
              store.dispatch('setOptions')
              emit('submitSuccess')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }
    const getOptionList = () => {
      // 将mediaForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(mediaForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi.getOptionList(params).then((res) => {
        // res.data.data是数组，需要转换为对象
        const obj = formatResToObj(res.data.data)
        formatResToForm(mediaForm, obj)
      })
    }
    onMounted(() => {
      getOptionList()
    })
    return {
      mediaFormRef,
      mediaForm,
      mediaRules,
      mediaSubmit,
    }
  },
}
</script>
