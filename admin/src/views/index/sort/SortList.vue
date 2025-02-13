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
        <!-- totalPostCount -->
        <el-table-column prop="totalPostCount" label="总文章数" min-width="100">
          <template #default="{ row }">
            <span>{{ row.totalPostCount }}</span>
            <span v-if="row.children && row.children.length > 0">
              + {{ row.childrenTotalPostCount }} ({{
                row.totalPostCount + row.childrenTotalPostCount
              }})
            </span>
          </template>
        </el-table-column>
        <!-- publicPostCount 公开文章数 -->
        <el-table-column
          prop="publicPostCount"
          label="公开文章数"
          min-width="100"
        >
          <template #default="{ row }">
            <span>{{ row.publicPostCount }}</span>
            <span v-if="row.children && row.children.length > 0">
              + {{ row.childrenPublicPostCount }} ({{
                row.publicPostCount + row.childrenPublicPostCount
              }})
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="分类描述" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteSort(row)"
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
import { copyToClipboard, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

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
          const data = res.data.data
          // 遍历数据
          data.forEach((item, index) => {
            if (item.children && item.children.length > 0) {
              let childrenPublicPostCount = 0
              let childrenTotalPostCount = 0
              item.children.forEach((child) => {
                childrenPublicPostCount += child.publicPostCount
                childrenTotalPostCount += child.totalPostCount
              })
              item.childrenPublicPostCount = childrenPublicPostCount
              item.childrenTotalPostCount = childrenTotalPostCount
            }
          })
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
    const deleteSort = (row) => {
      const id = row._id
      const title = escapeHtml(row.sortname)

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除分类：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteSort({ id }).then(() => {
            ElMessage.success('删除成功')
            getSortList()
          })
        },
      })
        .then(() => {})
        .catch((error) => {
          console.log('Dialog closed:', error)
        })
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
