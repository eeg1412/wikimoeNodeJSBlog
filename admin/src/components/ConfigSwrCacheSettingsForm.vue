<template>
  <el-form
    :model="swrCacheSettingsForm"
    :rules="swrCacheSettingsRules"
    ref="swrCacheSettingsFormRef"
    label-width="160px"
    v-if="inited"
  >
    <el-form-item label="开启SWR缓存" prop="swrCacheEnabled">
      <el-switch v-model="swrCacheSettingsForm.swrCacheEnabled"></el-switch>
      <div class="w_10">
        ※开启后，博客前端页面将启用SWR缓存，需要blog前端重启后生效
      </div>
    </el-form-item>

    <el-form-item label="SWR缓存时间(秒)" prop="swrCacheMaxAge">
      <el-input-number
        v-model.number="swrCacheSettingsForm.swrCacheMaxAge"
        type="number"
        placeholder="缓存时间"
        style="width: 200px"
        :min="1"
        :max="86400"
      >
      </el-input-number>
      <div class="w_10">※页面缓存的最大时间（秒），默认10秒</div>
    </el-form-item>

    <el-form-item label="过期缓存保留时间(秒)" prop="swrCacheStaleMaxAge">
      <el-input-number
        v-model.number="swrCacheSettingsForm.swrCacheStaleMaxAge"
        type="number"
        placeholder="过期缓存保留时间"
        style="width: 200px"
        :min="1"
        :max="604800"
      >
      </el-input-number>
      <div class="w_10">
        ※过期后缓存数据仍然可用的时间（秒），在此期间会在后台刷新缓存，默认3600秒
      </div>
    </el-form-item>

    <el-form-item label="清空缓存">
      <el-button type="danger" @click="handleClearCache">一键清空缓存</el-button>
      <div class="w_10">
        ※点击后将发送缓存清除信号，blog前端会在下次请求时清除旧缓存
      </div>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="swrCacheSettingsSubmit"
        >提交</el-button
      >
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
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup(props, { emit }) {
    // SWR缓存设置
    const swrCacheSettingsFormRef = ref(null)
    const swrCacheSettingsForm = reactive({
      // 是否开启SWR缓存
      swrCacheEnabled: false,
      // SWR缓存最大时间（秒）
      swrCacheMaxAge: 10,
      // SWR缓存过期时间（秒）
      swrCacheStaleMaxAge: 3600
    })
    const swrCacheSettingsRules = {}
    const swrCacheSettingsSubmit = () => {
      swrCacheSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(swrCacheSettingsForm).forEach(key => {
            params.push({
              name: key,
              value: swrCacheSettingsForm[key]
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(swrCacheSettingsForm, obj)
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
      // 将swrCacheSettingsForm的key转换为数组
      const params = {
        nameList: []
      }
      Object.keys(swrCacheSettingsForm).forEach(key => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then(res => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(swrCacheSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    const handleClearCache = () => {
      ElMessageBox.confirm('确定要清空缓存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          authApi.clearCache().then(() => {
            ElMessage.success('缓存清除信号已发送')
          })
        })
        .catch(() => {})
    }

    onMounted(() => {
      getOptionList()
    })
    return {
      swrCacheSettingsFormRef,
      swrCacheSettingsForm,
      swrCacheSettingsRules,
      swrCacheSettingsSubmit,
      inited,
      handleClearCache
    }
  }
}
</script>
