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
        <el-table-column prop="sortname" label="分类名称" min-width="300">
          <template #default="{ row }">
            <div class="di">{{ row.sortname }}</div>
            <!-- 点击打开按钮 -->
            <div class="dib ml5 vt">
              <el-link type="primary" @click="goToBlog(row)"
                ><i class="fas fa-external-link-alt"></i
              ></el-link>
            </div>
            <!-- 点击复制按钮 -->
            <div class="dib ml5 vt">
              <el-link type="primary" @click="copyPage(row)"
                ><i class="far fa-clone"></i
              ></el-link>
            </div>
          </template>
        </el-table-column>
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
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from '@/store'
import { copyToClipboard } from '@/utils/utils'

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
    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const getPath = (row) => {
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      return `${siteUrl.value}/post/list/sort/${row.alias || row._id}/1`
    }
    const goToBlog = (row) => {
      const url = getPath(row)
      window.open(url, '_blank')
    }
    const copyPage = (row) => {
      const url = getPath(row)
      copyToClipboard(url)
    }
    onMounted(() => {
      getSortList()
    })
    return {
      handleAdd,
      list,
      goEdit,
      deleteSort,
      goToBlog,
      copyPage,
    }
  },
}
</script>
<style lang=""></style>
