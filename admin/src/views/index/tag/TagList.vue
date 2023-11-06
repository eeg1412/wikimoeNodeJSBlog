<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>标签</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getTagList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入标签名称"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getTagList(true)">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- tags -->
    <div class="mb20">
      <el-table :data="tagList" row-key="_id" border default-expand-all>
        <el-table-column prop="tagname" label="标签名称" />

        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteTag(row._id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="clearfix">
      <el-pagination
        class="fr"
        background
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="params.page"
      />
    </div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const tagList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getTagList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getTagList(params)
        .then((res) => {
          tagList.value = res.data.list
          total.value = res.data.total
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'TagAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getTagList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'TagEdit',
        params: {
          id,
        },
      })
    }
    const deleteTag = (id) => {
      ElMessageBox.confirm('确定要删除吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id,
          }
          authApi
            .deleteTag(params)
            .then(() => {
              ElMessage.success('删除成功')
              getTagList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }
    onMounted(() => {
      initParams()
      getTagList()
    })
    return {
      tagList,
      params,
      total,
      getTagList,
      handleAdd,
      goEdit,
      deleteTag,
    }
  },
}
</script>
<style lang=""></style>
