<template>
  <el-form
    :model="otherSettingsForm"
    :rules="otherSettingsRules"
    ref="otherSettingsFormRef"
    label-width="120px"
  >
    <el-form-item label="引用域名白名单" prop="siteReferrerWhiteList">
      <el-input
        type="textarea"
        v-model="otherSettingsForm.siteReferrerWhiteList"
        placeholder="英文逗号隔开"
      ></el-input>
    </el-form-item>

    <el-form-item label="敏感关键词" prop="siteBannedKeywordList">
      <el-input
        type="textarea"
        v-model="otherSettingsForm.siteBannedKeywordList"
        placeholder="英文逗号隔开"
      ></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="otherSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { formatResToForm, formatResToObj } from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup(props, { emit }) {
    // 其他设置
    const otherSettingsFormRef = ref(null)
    const otherSettingsForm = reactive({
      // 引用白名单
      siteReferrerWhiteList: '',
      // 禁止评论关键词
      siteBannedKeywordList: '',
    })
    const otherSettingsRules = {}
    const otherSettingsSubmit = () => {
      otherSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(otherSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: otherSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(otherSettingsForm, obj)
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
      // 将otherSettingsForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(otherSettingsForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi.getOptionList(params).then((res) => {
        // res.data.data是数组，需要转换为对象
        const obj = formatResToObj(res.data.data)
        formatResToForm(otherSettingsForm, obj)
      })
    }
    onMounted(() => {
      getOptionList()
    })
    return {
      otherSettingsFormRef,
      otherSettingsForm,
      otherSettingsRules,
      otherSettingsSubmit,
    }
  },
}
</script>
