<template>
  <el-form
    class="config-multilingual-form"
    :model="multilingualSettingsForm"
    :rules="multilingualSettingsRules"
    ref="multilingualSettingsFormRef"
    label-width="140px"
    v-if="inited"
  >
    <el-form-item label="开启多语言" prop="siteEnableMultilingual">
      <el-switch
        v-model="multilingualSettingsForm.siteEnableMultilingual"
      ></el-switch>
    </el-form-item>

    <el-form-item label="默认站点语言" prop="siteDefaultLanguage">
      <el-select
        class="config-multilingual-language-select"
        v-model="multilingualSettingsForm.siteDefaultLanguage"
        placeholder="请选择默认站点语言"
      >
        <el-option
          v-for="item in supportedLanguageOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="multilingualSettingsSubmit">
        提交
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import {
  formatResToForm,
  formatResToObj,
  fieldErrorNotice
} from '@/utils/utils'
import { ref, reactive, onMounted } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage } from 'element-plus'
import {
  DEFAULT_LANGUAGE_CODE,
  SUPPORTED_LANGUAGE_OPTIONS
} from '@/config/languages'

export default {
  name: 'ConfigMultilingualSettingsForm',
  emits: ['submitSuccess'],
  setup(props, { emit }) {
    const multilingualSettingsFormRef = ref(null)
    const multilingualSettingsForm = reactive({
      siteEnableMultilingual: false,
      siteDefaultLanguage: DEFAULT_LANGUAGE_CODE
    })

    const multilingualSettingsRules = {
      siteDefaultLanguage: [
        { required: true, message: '请选择默认站点语言', trigger: 'change' }
      ]
    }

    const supportedLanguageOptions = SUPPORTED_LANGUAGE_OPTIONS

    const multilingualSettingsSubmit = () => {
      multilingualSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(multilingualSettingsForm).forEach(key => {
            params.push({
              name: key,
              value: multilingualSettingsForm[key]
            })
          })

          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(multilingualSettingsForm, obj)
              store.dispatch('setOptions')
              emit('submitSuccess')
              ElMessage.success('更新成功')
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          fieldErrorNotice(fields)
          return false
        }
      })
    }

    const inited = ref(false)
    const getOptionList = () => {
      const params = {
        nameList: []
      }
      Object.keys(multilingualSettingsForm).forEach(key => {
        params.nameList.push(key)
      })

      authApi
        .getOptionList(params)
        .then(res => {
          const obj = formatResToObj(res.data.data)
          formatResToForm(multilingualSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    onMounted(() => {
      getOptionList()
    })

    return {
      multilingualSettingsFormRef,
      multilingualSettingsForm,
      multilingualSettingsRules,
      multilingualSettingsSubmit,
      supportedLanguageOptions,
      inited
    }
  }
}
</script>

<style scoped>
.config-multilingual-language-select {
  width: 100%;
  max-width: 320px;
}

@media (max-width: 767px) {
  .config-multilingual-form :deep(.el-form-item) {
    display: block;
  }

  .config-multilingual-form :deep(.el-form-item__label) {
    justify-content: flex-start;
    width: 100% !important;
  }

  .config-multilingual-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>
