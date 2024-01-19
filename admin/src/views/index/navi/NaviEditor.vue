<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'NaviList' }"
          >导航列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="导航名称" prop="naviname">
          <el-input
            v-model="form.naviname"
            placeholder="请输入导航名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="导航URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入导航URL"></el-input>
        </el-form-item>
        <el-form-item label="新标签打开" prop="newtab">
          <el-switch v-model="form.newtab" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">不显示</el-radio>
            <el-radio :label="1">显示</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="taxis">
          <el-input-number v-model="form.taxis" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="父导航" prop="parent">
          <el-select v-model="form.parent" clearable placeholder="请选择父导航">
            <el-option
              v-for="item in naviList"
              :key="item._id"
              :label="item.naviname"
              :value="item._id"
              :disabled="item._id === id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="本站链接" prop="isdefault">
          <el-switch v-model="form.isdefault" />
        </el-form-item>
        <el-form-item label="页面参数" prop="query">
          <el-input
            v-model="form.query"
            type="textarea"
            placeholder="请输入页面参数如：?id=1&name=2"
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
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      naviname: '',
      url: '',
      newtab: false,
      status: 0,
      taxis: 0,
      parent: null,
      isdefault: false,
      query: '',
      __v: null,
    })
    const rules = reactive({
      naviname: [
        { required: true, message: '请输入导航名称', trigger: 'blur' },
      ],
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) {
          return false
        }
        const data = {
          ...form,
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateNavi(data)
            .then(() => {
              router.push({
                name: 'NaviList',
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createNavi(data)
            .then(() => {
              router.push({
                name: 'NaviList',
              })
            })
            .catch(() => {})
        }
      })
    }

    const getNaviDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getNaviDetail(params)
        .then((res) => {
          form.__v = res.data.data.__v
          form.naviname = res.data.data.naviname
          form.url = res.data.data.url
          form.newtab = res.data.data.newtab
          form.status = res.data.data.status
          form.taxis = res.data.data.taxis
          form.parent = res.data.data.parent || null
          form.isdefault = res.data.data.isdefault
          form.query = res.data.data.query
        })
        .catch(() => {})
    }

    const naviList = ref([])
    const getNaviList = () => {
      authApi
        .getNaviList()
        .then((res) => {
          naviList.value = res.data.data
        })
        .catch(() => {})
    }
    onMounted(() => {
      getNaviList()
      if (id.value) {
        getNaviDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      naviList,
    }
  },
}
</script>
<style scoped></style>
