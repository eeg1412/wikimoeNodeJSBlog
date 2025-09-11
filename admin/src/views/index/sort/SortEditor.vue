<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'SortList' }"
          >分类列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="分类名称" prop="sortname">
          <el-input
            v-model="form.sortname"
            placeholder="请输入分类名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="分类别名" prop="alias">
          <el-input
            v-model="form.alias"
            maxlength="64"
            placeholder="请输入分类别名"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序值" prop="taxis">
          <!-- 数字输入 -->
          <el-input-number
            v-model="form.taxis"
            :min="0"
            :precision="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="父级分类" prop="parent">
          <!-- select -->
          <el-select
            v-model="form.parent"
            clearable
            placeholder="请选择父级分类"
          >
            <el-option
              v-for="item in parentSortList"
              :key="item._id"
              :label="item.sortname"
              :value="item._id"
              :disabled="item._id === id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            placeholder="请输入分类描述"
            type="textarea"
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
    // // sortname	String	是	否	无	分类名称
    // alias	String	否	否	无	分类别名
    // taxis	Number	否	否	0	排序值
    // parent	ObjectId	否	否	无	父级分类 ID
    // description	String	否	否	无	分类描述
    const form = reactive({
      sortname: '',
      alias: '',
      taxis: 0,
      parent: null,
      description: '',
      __v: null
    })
    const rules = reactive({
      sortname: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const data = {
          sortname: form.sortname,
          alias: form.alias,
          taxis: form.taxis,
          parent: form.parent,
          description: form.description
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateSort(data)
            .then(() => {
              router.push({
                name: 'SortList'
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createSort(data)
            .then(() => {
              router.push({
                name: 'SortList'
              })
            })
            .catch(() => {})
        }
      })
    }

    const parentSortList = ref([])
    const getSortList = () => {
      authApi
        .getSortList()
        .then(res => {
          parentSortList.value = res.data.data
        })
        .catch(() => {})
    }
    const getSortDetail = () => {
      const params = {
        id: id.value
      }
      authApi
        .getSortDetail(params)
        .then(res => {
          form.sortname = res.data.data.sortname
          form.alias = res.data.data.alias
          form.taxis = res.data.data.taxis
          form.parent = res.data.data.parent
          form.description = res.data.data.description
          form.__v = res.data.data.__v
        })
        .catch(() => {})
    }
    onMounted(() => {
      getSortList()
      if (id.value) {
        getSortDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      parentSortList
    }
  }
}
</script>
<style scoped></style>
