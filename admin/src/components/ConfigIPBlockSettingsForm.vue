<template>
  <el-form
    :model="IPBlockSettingsForm"
    :rules="IPBlockSettingsRules"
    ref="IPBlockSettingsFormRef"
    label-width="140px"
    v-if="inited"
  >
    <el-form-item label="评论IP黑名单" prop="siteCommentIPBlockList">
      <TagsInput
        v-model="IPBlockSettingsForm.siteCommentIPBlockList"
        placeholder="输入IP地址"
      />
    </el-form-item>

    <el-form-item label="其他操作IP黑名单" prop="siteLogIPBlockList">
      <TagsInput
        v-model="IPBlockSettingsForm.siteLogIPBlockList"
        placeholder="输入IP地址"
      />
      <div class="w_10">会禁止这些IP的日志记录、点赞、投票</div>
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
      // 其他操作IP黑名单
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
