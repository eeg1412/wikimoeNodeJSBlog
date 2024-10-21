<template>
  <el-form
    :model="commentSettingsForm"
    :rules="commentSettingsRules"
    ref="commentSettingsFormRef"
    label-width="120px"
    v-if="inited"
  >
    <!-- 评论设置 -->

    <el-form-item label="开启评论" prop="siteEnableComment">
      <el-switch v-model="commentSettingsForm.siteEnableComment"></el-switch>
    </el-form-item>
    <el-form-item label="发表评论间隔" prop="siteCommentInterval">
      <!-- 数字 1-100 -->
      <el-input-number
        v-model="commentSettingsForm.siteCommentInterval"
        controls-position="right"
        :min="1"
        :max="100"
        :step="1"
      ></el-input-number
      ><span class="pl5">秒</span>
    </el-form-item>
    <el-form-item label="开启评论审核" prop="siteEnableCommentReview">
      <el-switch
        v-model="commentSettingsForm.siteEnableCommentReview"
      ></el-switch>
    </el-form-item>
    <el-form-item label="评论分页" prop="siteCommentPageSize">
      <!-- 数字 1-100 -->
      <el-input-number
        v-model="commentSettingsForm.siteCommentPageSize"
        controls-position="right"
        :min="1"
        :max="100"
        :step="1"
      ></el-input-number>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="commentSettingsSubmit">提交</el-button>
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
    // 评论设置
    const commentSettingsFormRef = ref(null)
    const commentSettingsForm = reactive({
      // 开启评论
      siteEnableComment: false,
      // 发表评论间隔
      siteCommentInterval: 10,
      // 开启评论审核
      siteEnableCommentReview: false,
      // 评论分页
      siteCommentPageSize: 10,
    })
    const commentSettingsRules = {
      siteCommentInterval: [
        { required: true, message: '请输入发表评论间隔', trigger: 'blur' },
      ],
      siteCommentPageSize: [
        { required: true, message: '请输入评论分页', trigger: 'blur' },
      ],
    }
    const commentSettingsSubmit = () => {
      commentSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(commentSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: commentSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(commentSettingsForm, obj)
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
    const inited = ref(false)
    const getOptionList = () => {
      // 将commentSettingsForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(commentSettingsForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then((res) => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(commentSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }
    onMounted(() => {
      getOptionList()
    })

    return {
      commentSettingsFormRef,
      commentSettingsForm,
      commentSettingsRules,
      commentSettingsSubmit,
      inited,
    }
  },
}
</script>
<style></style>
