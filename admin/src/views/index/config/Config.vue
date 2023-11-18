<template>
  <div class="common-right-panel-form common-limit-width">
    <h3 class="common-title">设置</h3>
    <el-tabs v-model="activeName">
      <el-tab-pane label="媒体设置" name="media">
        <el-form
          :model="mediaForm"
          :rules="mediaRules"
          ref="mediaFormRef"
          label-width="150px"
        >
          <el-form-item label="开启图片压缩" prop="imgSettingEnableImgCompress">
            <el-switch
              v-model="mediaForm.imgSettingEnableImgCompress"
            ></el-switch>
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
            <el-form-item
              label="图片压缩最长边"
              prop="imgSettingCompressMaxSize"
            >
              <!-- 数字 1-4096 -->
              <el-input-number
                v-model="mediaForm.imgSettingCompressMaxSize"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
          </div>
          <el-form-item
            label="开启图片缩略图"
            prop="imgSettingEnableImgThumbnail"
          >
            <el-switch
              v-model="mediaForm.imgSettingEnableImgThumbnail"
            ></el-switch>
          </el-form-item>
          <div class="config-border-item">
            <div class="config-border-item-title">
              缩略图设置<span class="config-border-item-tip"
                >※当开启缩略图时生效</span
              >
            </div>
            <el-form-item
              label="图片缩略图最长边"
              prop="imgSettingThumbnailMaxSize"
            >
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
// ElMessage
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const activeName = ref('media')
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
    // // 图片缩略图最长边
    // imgSettingThumbnailMaxSize: 680,
    const mediaForm = reactive({
      imgSettingEnableImgCompress: false,
      imgSettingEnableImgCompressWebp: false,
      imgSettingCompressQuality: 80,
      imgSettingCompressMaxSize: 1920,
      imgSettingEnableImgThumbnail: false,
      imgSettingThumbnailMaxSize: 680,
    })
    const mediaRules = {
      imgSettingCompressQuality: [
        { required: true, message: '请输入图片压缩质量', trigger: 'blur' },
      ],
      imgSettingCompressMaxSize: [
        { required: true, message: '请输入图片压缩最长边', trigger: 'blur' },
      ],
      imgSettingThumbnailMaxSize: [
        {
          required: true,
          message: '请输入图片缩略图最长边',
          trigger: 'blur',
        },
      ],
    }

    const getConfig = () => {
      authApi.getConfig().then((res) => {
        Object.keys(mediaForm).forEach((key) => {
          mediaForm[key] = res.data.data[key]
        })
      })
    }
    const mediaSubmit = () => {
      mediaFormRef.value.validate((valid) => {
        if (valid) {
          authApi
            .updateConfigMedia(mediaForm)
            .then((res) => {
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

    onMounted(() => {
      getConfig()
    })
    return {
      activeName,
      mediaFormRef,
      mediaForm,
      mediaRules,
      mediaSubmit,
    }
  },
}
</script>
<style scoped>
.config-border-item {
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
}
.config-border-item-title {
  font-weight: 600;
  margin-bottom: 10px;
}
.config-border-item-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
  padding-left: 10px;
}
</style>
