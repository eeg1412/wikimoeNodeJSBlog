<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'TagList' }"
          >标签列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标签名称" prop="tagname">
          <el-input
            v-model="form.tagname"
            placeholder="请输入标签名称"
            @blur="
              form.tagname = replaceSpacesWithUnderscores(form.tagname || '')
            "
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { authApi } from '@/api'
import { replaceSpacesWithUnderscores } from '@/utils/utils'
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    // // tagname	String	是	否	无	标签名称
    const form = reactive({
      tagname: '',
      __v: null
    })
    const rules = reactive({
      tagname: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const data = {
          tagname: form.tagname
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateTag(data)
            .then(() => {
              router.push({
                name: 'TagList'
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createTag(data)
            .then(() => {
              router.push({
                name: 'TagList'
              })
            })
            .catch(() => {})
        }
      })
    }

    const getTagDetail = () => {
      const params = {
        id: id.value
      }
      authApi
        .getTagDetail(params)
        .then(res => {
          form.tagname = res.data.data.tagname
          form.__v = res.data.data.__v
        })
        .catch(() => {})
    }
    onMounted(() => {
      if (id.value) {
        getTagDetail()
      }
    })
    return {
      replaceSpacesWithUnderscores,
      id,
      form,
      rules,
      formRef,
      submit
    }
  }
}
</script>
<style scoped></style>
