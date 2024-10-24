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

    <div class="config-border-item">
      <div class="config-border-item-title mb5">
        随机相似内容<span class="config-border-item-tip"></span>
      </div>
      <el-form-item label="文章数" prop="sitePostRandomSimilarCount">
        <el-input-number
          v-model="sitePostForm.sitePostRandomSimilarCount"
          controls-position="right"
          :min="0"
          :step="1"
        ></el-input-number>
        <div class="w_10">※0为不显示随机相似内容</div>
      </el-form-item>
      <!-- 内容范围 1博文 2推文 checkbox -->
      <el-form-item label="内容范围" prop="sitePostRandomSimilarRange">
        <el-checkbox-group v-model="sitePostForm.sitePostRandomSimilarRange">
          <el-checkbox label="1">博文</el-checkbox>
          <el-checkbox label="2">推文</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!-- 显示范围 1博文 2推文 checkbox -->
      <el-form-item label="显示范围" prop="sitePostRandomSimilarShowRange">
        <el-checkbox-group
          v-model="sitePostForm.sitePostRandomSimilarShowRange"
        >
          <el-checkbox label="1">博文</el-checkbox>
          <el-checkbox label="2">推文</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!-- 随机相似内容标题 -->
      <el-form-item label="标题" prop="sitePostRandomSimilarTitle">
        <el-input v-model="sitePostForm.sitePostRandomSimilarTitle"></el-input>
      </el-form-item>
    </div>

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
      // 随机相似内容数
      sitePostRandomSimilarCount: 0,
      // 随机相似内容范围
      sitePostRandomSimilarRange: [],
      // 随机相似内容显示范围
      sitePostRandomSimilarShowRange: [],
      // 随机相似内容标题
      sitePostRandomSimilarTitle: '相似内容',
    })
    const sitePostRules = {}
    const sitePostSubmit = () => {
      sitePostFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(sitePostForm).forEach((key) => {
            if (Array.isArray(sitePostForm[key])) {
              // 转换成字符串
              params.push({
                name: key,
                value: sitePostForm[key].join(','),
              })
            } else {
              params.push({
                name: key,
                value: sitePostForm[key],
              })
            }
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
