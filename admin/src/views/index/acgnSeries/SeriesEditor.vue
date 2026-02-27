<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'AcgnSeriesList' }"
          >系列列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-tag
            class="mr5 mb5"
            v-for="(item, index) in form.alias"
            :key="index"
            closable
            @close="handleAliasClose(item)"
          >
            {{ item }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-model="aliasInputValue"
            ref="aliasInputRef"
            size="small"
            placeholder="添加别名"
            @keyup.enter="handleAliasInputConfirm"
            @blur="handleAliasInputConfirm"
          ></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input type="textarea" :rows="5" v-model="form.summary"></el-input>
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

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      name: '',
      alias: [],
      summary: '',
      __v: null
    })
    const rules = reactive({
      name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 1, message: '名称至少1个字符', trigger: 'blur' }
      ]
    })
    const formRef = ref(null)

    const submit = () => {
      formRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const data = {
          ...form
        }
        if (id.value) {
          data.id = id.value
          authApi
            .updateAcgnSeries(data)
            .then(() => {
              router.push({ name: 'AcgnSeriesList' })
            })
            .catch(() => {})
        } else {
          authApi
            .createAcgnSeries(data)
            .then(() => {
              router.push({ name: 'AcgnSeriesList' })
            })
            .catch(() => {})
        }
      })
    }

    const getSeriesDetail = () => {
      const params = { id: id.value }
      authApi
        .getAcgnSeriesDetail(params)
        .then(res => {
          Object.keys(form).forEach(key => {
            form[key] = res.data.data[key]
          })
        })
        .catch(() => {})
    }

    // 别名 tag 输入
    const aliasInputValue = ref('')
    const aliasInputRef = ref(null)
    const handleAliasClose = tag => {
      form.alias.splice(form.alias.indexOf(tag), 1)
    }
    const handleAliasInputConfirm = () => {
      if (aliasInputValue.value) {
        form.alias.push(aliasInputValue.value)
      }
      aliasInputValue.value = ''
    }

    onMounted(() => {
      if (id.value) {
        getSeriesDetail()
      }
    })

    return {
      id,
      form,
      rules,
      formRef,
      submit,
      aliasInputValue,
      aliasInputRef,
      handleAliasClose,
      handleAliasInputConfirm
    }
  }
}
</script>
<style scoped>
.input-new-tag {
  width: 120px;
  margin-right: 5px;
  margin-bottom: 5px;
  vertical-align: bottom;
}
</style>
