<template>
  <el-form
    :model="adSettingsForm"
    :rules="adSettingsRules"
    ref="adSettingsFormRef"
    label-width="160px"
    v-if="inited"
  >
    <!-- 是否开启谷歌广告 -->
    <el-form-item label="开启谷歌广告" prop="googleAdEnabled">
      <el-switch v-model="adSettingsForm.googleAdEnabled"></el-switch>
    </el-form-item>

    <!-- 谷歌广告ID -->
    <el-form-item label="谷歌广告ID" prop="googleAdId">
      <el-input
        v-model="adSettingsForm.googleAdId"
        placeholder="请输入谷歌广告ID"
      ></el-input>
    </el-form-item>
    <!-- 开启文章底部谷歌广告 -->
    <el-form-item
      label="开启文章底部谷歌广告"
      props="googleAdPostBottomEnabled"
    >
      <el-switch v-model="adSettingsForm.googleAdPostBottomEnabled"></el-switch>
    </el-form-item>
    <!-- 文章底部谷歌参数 -->
    <el-form-item label="文章底部谷歌参数" prop="googleAdPostBottomParams">
      <GoogleAdInput
        v-model="adSettingsForm.googleAdPostBottomParams"
      ></GoogleAdInput>
    </el-form-item>
    <!-- ads.txt -->
    <el-form-item label="ads.txt" prop="AdAdsTxt">
      <el-input
        v-model="adSettingsForm.AdAdsTxt"
        type="textarea"
        placeholder="请输入 ads.txt 内容"
      ></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="adSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { formatResToForm, formatResToObj } from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage } from 'element-plus'
import GoogleAdInput from '@/components/GoogleAdInput.vue'

export default {
  components: {
    GoogleAdInput,
  },
  setup(props, { emit }) {
    const adSettingsFormRef = ref(null)
    const adSettingsForm = reactive({
      // 是否开启谷歌广告
      googleAdEnabled: false,
      // 谷歌广告ID
      googleAdId: '',
      // 开启文章底部谷歌广告
      googleAdPostBottomEnabled: false,
      // 文章底部谷歌参数
      googleAdPostBottomParams: '',
      // ads.txt
      AdAdsTxt: '',
    })

    // 表单验证规则
    const adSettingsRules = computed(() => ({
      googleAdId: [
        {
          required: adSettingsForm.googleAdEnabled,
          message: '请输入谷歌广告ID',
          trigger: 'blur',
        },
      ],
      googleAdPostBottomParams: [
        {
          required: adSettingsForm.googleAdPostBottomEnabled,
          message: '请输入文章底部谷歌参数',
          trigger: 'blur',
        },
      ],
    }))

    const adSettingsSubmit = () => {
      adSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(adSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: adSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(adSettingsForm, obj)
              store.dispatch('setOptions')
              emit('submitSuccess')
              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
    }

    const inited = ref(false)
    const getOptionList = () => {
      const params = {
        nameList: Object.keys(adSettingsForm),
      }
      authApi
        .getOptionList(params)
        .then((res) => {
          const obj = formatResToObj(res.data.data)
          formatResToForm(adSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    onMounted(() => {
      getOptionList()
    })

    return {
      adSettingsFormRef,
      adSettingsForm,
      adSettingsRules,
      adSettingsSubmit,
      inited,
    }
  },
}
</script>
