<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>分类列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <div class="list-table-body no-search no-page">
      <el-table
        height="100%"
        :data="list"
        row-key="_id"
        border
        default-expand-all
      >
        <el-table-column prop="sortname" label="分类名称" />
        <el-table-column prop="alias" label="分类别名" />
        <el-table-column prop="taxis" label="排序值" />
        <el-table-column prop="description" label="分类描述" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteSort(row._id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup() {
    const router = useRouter()
    const handleAdd = () => {
      router.push({
        name: 'SortAdd',
      })
    }
    const list = ref([])
    const getSortList = () => {
      authApi
        .getSortList()
        .then((res) => {
          list.value = res.data.data
        })
        .catch(() => {})
    }
    const goEdit = (id) => {
      router.push({
        name: 'SortEdit',
        params: {
          id,
        },
      })
    }
    const deleteSort = (id) => {
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
            .deleteSort(params)
            .then(() => {
              ElMessage.success('删除成功')
              getSortList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    }
    onMounted(() => {
      getSortList()
    })
    return {
      handleAdd,
      list,
      goEdit,
      deleteSort,
    }
  },
}
</script>
<style lang=""></style>
