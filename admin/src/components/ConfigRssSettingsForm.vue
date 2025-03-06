<template>
  <el-form
    :model="rssSettingsForm"
    :rules="rssSettingsRules"
    ref="rssSettingsFormRef"
    label-width="120px"
    v-if="inited"
  >
    <!-- RSS -->

    <el-form-item label="开启RSS" prop="siteEnableRss">
      <el-switch v-model="rssSettingsForm.siteEnableRss"></el-switch>
    </el-form-item>
    <el-form-item label="RSS显示条数" prop="siteRssMaxCount">
      <!-- 数字 1-100 -->
      <el-input-number
        v-model="rssSettingsForm.siteRssMaxCount"
        controls-position="right"
        :min="1"
        :max="100"
        :step="1"
        :precision="0"
      ></el-input-number>
    </el-form-item>
    <!-- 底部显示RSS siteShowRssInFooter -->
    <el-form-item label="底部显示RSS" prop="siteShowRssInFooter">
      <el-switch v-model="rssSettingsForm.siteShowRssInFooter"></el-switch>
    </el-form-item>

    <!-- <el-form-item label="RSS输出全文" prop="siteRssFullText">
            <el-switch v-model="rssSettingsForm.siteRssFullText"></el-switch>
          </el-form-item> -->

    <el-form-item>
      <el-button type="primary" @click="rssSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import {
  formatResToForm,
  formatResToObj,
  fieldErrorNotice,
} from '@/utils/utils'
import { ref, reactive, onMounted } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  setup(props, { emit }) {
    // RSS设置
    const rssSettingsFormRef = ref(null)
    const rssSettingsForm = reactive({
      // 开启RSS
      siteEnableRss: false,
      // RSS显示条数
      siteRssMaxCount: 10,
      // 底部显示RSS
      siteShowRssInFooter: false,
      // RSS输出全文
      // siteRssFullText: false,
    })
    const rssSettingsRules = {
      siteRssMaxCount: [
        { required: true, message: '请输入RSS显示条数', trigger: 'blur' },
      ],
    }
    const rssSettingsSubmit = () => {
      rssSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(rssSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: rssSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(rssSettingsForm, obj)
              store.dispatch('setOptions')

              emit('submitSuccess')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
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
      // 将rssSettingsForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(rssSettingsForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then((res) => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(rssSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    onMounted(() => {
      getOptionList()
    })

    return {
      rssSettingsFormRef,
      rssSettingsForm,
      rssSettingsRules,
      rssSettingsSubmit,
      inited,
    }
  },
}
</script>
<style></style>
