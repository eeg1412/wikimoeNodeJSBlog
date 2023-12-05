<template>
<div class="common-right-panel-form common-limit-width">
  <div class="pb20">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'SidebarList' }"
        >侧边栏列表</el-breadcrumb-item
      >
      <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
      <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
  <div>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
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
    __v: null,
  })
  const rules = reactive({
  })
  const formRef = ref(null)
  const submit = () => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        return false
      }
      const data = {
  
      }
      if (id.value) {
        // 编辑
        data.id = id.value
        data.__v = form.__v
        authApi
          .updateSidebar(data)
          .then(() => {
            router.push({
              name: 'SidebarList',
            })
          })
          .catch(() => {})
      } else {
        // 追加
        authApi
          .createSidebar(data)
          .then(() => {
            router.push({
              name: 'SidebarList',
            })
          })
          .catch(() => {})
      }
    })
  }

  const getSidebarDetail = () => {
    const params = {
      id: id.value,
    }
    authApi
      .getSidebarDetail(params)
      .then((res) => {
        form.__v = res.data.data.__v
      })
      .catch(() => {})
  }
  onMounted(() => {
    if (id.value) {
      getSidebarDetail()
    }
  })
  return {
    id,
    form,
    rules,
    formRef,
    submit,
  }
},
}
</script>
<style scoped></style>