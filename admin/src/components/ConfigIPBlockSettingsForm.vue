<template>
  <el-form
    :model="IPBlockSettingsForm"
    :rules="IPBlockSettingsRules"
    ref="IPBlockSettingsFormRef"
    label-width="160px"
    v-if="inited"
  >
    <el-form-item label="评论IP黑名单" prop="siteCommentIPBlockList">
      <TagsInput
        v-model="IPBlockSettingsForm.siteCommentIPBlockList"
        placeholder="添加IP"
      />
    </el-form-item>

    <el-form-item label="日志记录IP黑名单" prop="siteLogIPBlockList">
      <TagsInput
        v-model="IPBlockSettingsForm.siteLogIPBlockList"
        placeholder="添加IP"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="IPBlockSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import {
  formatResToForm,
  formatResToObj,
  fieldErrorNotice
} from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

export default {
  setup(props, { emit }) {
    // 其他设置
    const IPBlockSettingsFormRef = ref(null)
    const IPBlockSettingsForm = reactive({
      // 评论IP黑名单
      siteCommentIPBlockList: '',
      // 日志记录IP黑名单
      siteLogIPBlockList: ''
    })
    const IPBlockSettingsRules = {}
    const IPBlockSettingsSubmit = () => {
      IPBlockSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(IPBlockSettingsForm).forEach(key => {
            params.push({
              name: key,
              value: IPBlockSettingsForm[key]
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(IPBlockSettingsForm, obj)
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
      // 将IPBlockSettingsForm的key转换为数组
      const params = {
        nameList: []
      }
      Object.keys(IPBlockSettingsForm).forEach(key => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then(res => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(IPBlockSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    onMounted(() => {
      getOptionList()
    })
    return {
      IPBlockSettingsFormRef,
      IPBlockSettingsForm,
      IPBlockSettingsRules,
      IPBlockSettingsSubmit,
      inited
    }
  }
}
</script>
