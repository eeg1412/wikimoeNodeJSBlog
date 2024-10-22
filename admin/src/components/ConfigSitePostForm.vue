<template>
  <el-form
    :model="sitePostForm"
    :rules="sitePostRules"
    ref="sitePostFormRef"
    label-width="140px"
    v-if="inited"
  >
    <!-- 博文底部共通内容 -->
    <el-form-item
      label="博文底部共通内容"
      class="blok-form-item"
      prop="sitePostCommonFooterContent"
    >
      <RichEditor5Switch
        v-model:content="sitePostForm.sitePostCommonFooterContent"
        v-model:isRichMode="sitePostForm.sitePostCommonFooterContentIsRichMode"
      ></RichEditor5Switch>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="sitePostSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { formatResToForm, formatResToObj } from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import RichEditor5Switch from '@/components/RichEditor5Switch'

export default {
  components: {
    RichEditor5Switch,
  },
  setup(props, { emit }) {
    // 其他设置
    const sitePostFormRef = ref(null)
    const sitePostForm = reactive({
      // 博文底部共通内容
      sitePostCommonFooterContent: '',
      sitePostCommonFooterContentIsRichMode: true,
    })
    const sitePostRules = {}
    const sitePostSubmit = () => {
      sitePostFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(sitePostForm).forEach((key) => {
            params.push({
              name: key,
              value: sitePostForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(sitePostForm, obj)
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
      // 将sitePostForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(sitePostForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then((res) => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(sitePostForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }
    onMounted(() => {
      getOptionList()
    })
    return {
      sitePostFormRef,
      sitePostForm,
      sitePostRules,
      sitePostSubmit,
      inited,
    }
  },
}
</script>
